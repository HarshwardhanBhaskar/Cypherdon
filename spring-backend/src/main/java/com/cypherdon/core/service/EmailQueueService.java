package com.cypherdon.core.service;

import com.cypherdon.core.model.EmailStatus;
import com.cypherdon.core.model.EmailTask;
import com.cypherdon.core.repository.EmailTaskRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HexFormat;
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
        // 1. Generate idempotency key — prevents duplicate queuing
        String idempotencyKey = generateIdempotencyKey(userId, recipientEmail, subject);

        if (emailTaskRepository.existsByIdempotencyKey(idempotencyKey)) {
            throw new DuplicateEmailException(
                    "This exact email was already queued today. Duplicate sends are blocked."
            );
        }

        // 2. Check Rate Limits
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long sentToday = emailTaskRepository.countEmailsSentToday(userId, startOfDay);

        int limit = isPaidUser ? PAID_PLAN_LIMIT : FREE_PLAN_LIMIT;

        if (sentToday >= limit) {
            throw new RateLimitExceededException(
                    "Daily email limit reached (" + limit + "/" + limit + "). Upgrade to send more."
            );
        }

        // 3. Randomized Delay (10–20 minutes)
        int delayMinutes = ThreadLocalRandom.current().nextInt(10, 21);
        LocalDateTime scheduledTime = LocalDateTime.now().plusMinutes(delayMinutes);

        // 4. Create Task
        EmailTask task = new EmailTask();
        task.setUserId(userId);
        task.setRecipientEmail(recipientEmail);
        task.setSubject(subject);
        task.setBody(body);
        task.setResumeUrl(resumeUrl);
        task.setStatus(EmailStatus.PENDING);
        task.setScheduledAt(scheduledTime);
        task.setIdempotencyKey(idempotencyKey);

        EmailTask saved = emailTaskRepository.save(task);

        logger.info("📬 Queued email to {} for user {} — scheduled at {} ({}min delay)",
                recipientEmail, userId, scheduledTime, delayMinutes);

        return saved;
    }

    /**
     * Generates a deterministic key from userId + recipient + subject + date.
     * Same inputs on the same day → same key → duplicate rejected.
     */
    private String generateIdempotencyKey(UUID userId, String recipientEmail, String subject) {
        try {
            String raw = userId.toString() + "|" + recipientEmail + "|" + subject + "|" + LocalDate.now();
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            // Fallback to UUID if hashing somehow fails
            return UUID.randomUUID().toString();
        }
    }

    /**
     * Custom exception for rate limiting — controller returns HTTP 429.
     */
    public static class RateLimitExceededException extends RuntimeException {
        public RateLimitExceededException(String message) {
            super(message);
        }
    }

    /**
     * Custom exception for duplicate sends — controller returns HTTP 409.
     */
    public static class DuplicateEmailException extends RuntimeException {
        public DuplicateEmailException(String message) {
            super(message);
        }
    }
}
