package com.cypherdon.core.scheduler;

import com.cypherdon.core.model.EmailStatus;
import com.cypherdon.core.model.EmailTask;
import com.cypherdon.core.repository.EmailTaskRepository;
import com.cypherdon.core.service.SmtpSenderService;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

@Component
public class EmailWorker {

    private static final Logger logger = LoggerFactory.getLogger(EmailWorker.class);

    private static final int MAX_BATCH_SIZE = 5;
    private static final int MAX_RETRIES = 3;
    private static final long INTER_SEND_DELAY_MS = 3000;

    // Dedicated thread pool for email sending — isolates SMTP I/O from the scheduler thread
    private final ExecutorService emailExecutor = Executors.newFixedThreadPool(2);

    @Autowired
    private EmailTaskRepository emailTaskRepository;

    @Autowired
    private SmtpSenderService smtpSenderService;

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processEmailQueue() {
        List<EmailTask> tasks = emailTaskRepository.findTasksToProcess(
                EmailStatus.PENDING,
                LocalDateTime.now(),
                PageRequest.of(0, MAX_BATCH_SIZE)
        );

        if (tasks.isEmpty()) {
            return;
        }

        logger.info("[EmailWorker] Processing {} pending tasks", tasks.size());

        for (int i = 0; i < tasks.size(); i++) {
            EmailTask task = tasks.get(i);

            // Submit each email to the dedicated thread pool
            CompletableFuture.runAsync(() -> processSingleEmail(task), emailExecutor);

            // Anti-burst: stagger submissions
            if (i < tasks.size() - 1) {
                try {
                    Thread.sleep(INTER_SEND_DELAY_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    logger.warn("[EmailWorker] Interrupted during stagger delay.");
                    break;
                }
            }
        }
    }

    private void processSingleEmail(EmailTask task) {
        try {
            logger.info("[EmailWorker] Sending to {}", task.getRecipientEmail());
            smtpSenderService.sendEmail(task);

            // Success
            task.setStatus(EmailStatus.SENT);
            task.setSentAt(LocalDateTime.now());
            task.setErrorMessage(null);
            emailTaskRepository.save(task);
            logger.info("[EmailWorker] ✓ Sent to {}", task.getRecipientEmail());

        } catch (Exception e) {
            logger.error("[EmailWorker] ✗ Failed for {}: {}", task.getRecipientEmail(), e.getMessage());

            int retries = task.getRetryCount() + 1;
            task.setRetryCount(retries);
            task.setErrorMessage(e.getMessage());

            if (retries < MAX_RETRIES) {
                // Exponential backoff: 5min → 15min → 45min
                long backoffMinutes = 5L * (long) Math.pow(3, retries - 1);
                task.setScheduledAt(LocalDateTime.now().plusMinutes(backoffMinutes));
                logger.info("[EmailWorker] Re-queued {} (retry {}/{}, next attempt in {}min)",
                        task.getRecipientEmail(), retries, MAX_RETRIES, backoffMinutes);
            } else {
                task.setStatus(EmailStatus.FAILED);
                logger.error("[EmailWorker] Permanently failed for {} after {} retries.",
                        task.getRecipientEmail(), MAX_RETRIES);
            }

            emailTaskRepository.save(task);
        }
    }

    @PreDestroy
    public void shutdown() {
        logger.info("[EmailWorker] Shutting down executor pool...");
        emailExecutor.shutdown();
        try {
            if (!emailExecutor.awaitTermination(30, TimeUnit.SECONDS)) {
                emailExecutor.shutdownNow();
            }
        } catch (InterruptedException e) {
            emailExecutor.shutdownNow();
        }
    }
}
