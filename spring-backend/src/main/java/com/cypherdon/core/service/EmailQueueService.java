package com.cypherdon.core.service;

import com.cypherdon.core.model.EmailStatus;
import com.cypherdon.core.model.EmailTask;
import com.cypherdon.core.repository.EmailTaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class EmailQueueService {

    private static final Logger logger = LoggerFactory.getLogger(EmailQueueService.class);

    @Autowired
    private EmailTaskRepository emailTaskRepository;

    private static final int FREE_PLAN_LIMIT = 3;
    private static final int PAID_PLAN_LIMIT = 15;

    @Transactional
    public EmailTask queueEmail(UUID userId, String recipientEmail, String subject,
                                String body, String resumeUrl, boolean isPaidUser) {
        // 1. Check Rate Limits
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long sentToday = emailTaskRepository.countEmailsSentToday(userId, startOfDay);

        int limit = isPaidUser ? PAID_PLAN_LIMIT : FREE_PLAN_LIMIT;

        if (sentToday >= limit) {
            throw new RateLimitExceededException(
                    "Daily email limit reached (" + limit + "/" + limit + "). Upgrade to send more."
            );
        }

        // 2. Randomized Delay (10–20 minutes) — ThreadLocalRandom is thread-safe without contention
        int delayMinutes = ThreadLocalRandom.current().nextInt(10, 21);
        LocalDateTime scheduledTime = LocalDateTime.now().plusMinutes(delayMinutes);

        // 3. Create Task
        EmailTask task = new EmailTask();
        task.setUserId(userId);
        task.setRecipientEmail(recipientEmail);
        task.setSubject(subject);
        task.setBody(body);
        task.setResumeUrl(resumeUrl);
        task.setStatus(EmailStatus.PENDING);
        task.setScheduledAt(scheduledTime);

        EmailTask saved = emailTaskRepository.save(task);

        logger.info("Queued email to {} for user {} — scheduled at {} ({}min delay)",
                recipientEmail, userId, scheduledTime, delayMinutes);

        return saved;
    }

    /**
     * Custom exception for rate limiting — allows controllers to return proper HTTP 429.
     */
    public static class RateLimitExceededException extends RuntimeException {
        public RateLimitExceededException(String message) {
            super(message);
        }
    }
}
