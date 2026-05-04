package com.cypherdon.core.scheduler;

import com.cypherdon.core.model.EmailStatus;
import com.cypherdon.core.model.EmailTask;
import com.cypherdon.core.repository.EmailTaskRepository;
import com.cypherdon.core.service.SmtpSenderService;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.*;

@Component
public class EmailWorker {

    private static final Logger logger = LoggerFactory.getLogger(EmailWorker.class);

    private static final int BATCH_SIZE = 5;
    private static final int MAX_RETRIES = 3;
    private static final long INTER_SEND_DELAY_MS = 3000;
    private static final int STALE_THRESHOLD_MINUTES = 5;

    // Dedicated thread pool — isolates SMTP I/O from the scheduler thread
    private final ExecutorService smtpPool = Executors.newFixedThreadPool(2);

    @Autowired
    private EmailTaskRepository emailTaskRepository;

    @Autowired
    private SmtpSenderService smtpSenderService;

    /**
     * MAIN WORKER — runs every 30 seconds.
     *
     * Flow:
     * 1. Claims a batch using FOR UPDATE SKIP LOCKED (no duplicates)
     * 2. Atomically transitions them PENDING → PROCESSING
     * 3. Dispatches each to the SMTP thread pool with staggered delays
     */
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void processQueue() {
        // 1. Atomically claim a batch — locked rows are invisible to other workers
        List<EmailTask> batch = emailTaskRepository.claimNextBatch(LocalDateTime.now(), BATCH_SIZE);

        if (batch.isEmpty()) {
            return;
        }

        // 2. Transition PENDING → PROCESSING in bulk
        List<java.util.UUID> ids = batch.stream().map(EmailTask::getId).toList();
        int claimed = emailTaskRepository.claimTasks(ids, LocalDateTime.now());

        logger.info("📨 Claimed {} email tasks for processing", claimed);

        // 3. Dispatch to SMTP pool with staggered delays
        for (int i = 0; i < batch.size(); i++) {
            final EmailTask task = batch.get(i);
            final long delay = (long) i * INTER_SEND_DELAY_MS;

            CompletableFuture.runAsync(() -> {
                if (delay > 0) {
                    try { Thread.sleep(delay); } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                }
                sendWithRetryLogic(task);
            }, smtpPool);
        }
    }

    /**
     * STALE TASK RECOVERY — runs every 5 minutes.
     * If a worker crashes mid-send, tasks get stuck in PROCESSING.
     * This resets them back to PENDING after 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void recoverStaleTasks() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(STALE_THRESHOLD_MINUTES);
        int recovered = emailTaskRepository.recoverStaleTasks(cutoff);

        if (recovered > 0) {
            logger.warn("🔄 Recovered {} stale tasks (stuck in PROCESSING > {}min)",
                    recovered, STALE_THRESHOLD_MINUTES);
        }
    }

    private void sendWithRetryLogic(EmailTask task) {
        try {
            logger.info("📧 Sending to {}", task.getRecipientEmail());
            smtpSenderService.sendEmail(task);

            // Success → PROCESSING → SENT
            task.setStatus(EmailStatus.SENT);
            task.setSentAt(LocalDateTime.now());
            task.setErrorMessage(null);
            emailTaskRepository.save(task);

            logger.info("✅ Delivered to {}", task.getRecipientEmail());

        } catch (Exception e) {
            logger.error("❌ Failed for {}: {}", task.getRecipientEmail(), e.getMessage());

            int retries = task.getRetryCount() + 1;
            task.setRetryCount(retries);
            task.setErrorMessage(e.getMessage());

            if (retries < MAX_RETRIES) {
                // Exponential backoff: 5min → 15min → 45min
                long backoffMinutes = 5L * (long) Math.pow(3, retries - 1);
                task.setStatus(EmailStatus.PENDING); // Back to queue
                task.setScheduledAt(LocalDateTime.now().plusMinutes(backoffMinutes));
                task.setClaimedAt(null); // Release the claim

                logger.info("🔁 Re-queued {} (retry {}/{}, next in {}min)",
                        task.getRecipientEmail(), retries, MAX_RETRIES, backoffMinutes);
            } else {
                task.setStatus(EmailStatus.FAILED);
                logger.error("💀 Permanently failed for {} after {} retries",
                        task.getRecipientEmail(), MAX_RETRIES);
            }

            emailTaskRepository.save(task);
        }
    }

    @PreDestroy
    public void shutdown() {
        logger.info("👋 Email worker shutting down — waiting for active sends...");
        smtpPool.shutdown();
        try {
            if (!smtpPool.awaitTermination(30, TimeUnit.SECONDS)) {
                smtpPool.shutdownNow();
            }
        } catch (InterruptedException e) {
            smtpPool.shutdownNow();
        }
    }
}
