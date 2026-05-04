package com.cypherdon.core.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "email_tasks", indexes = {
    // Worker query: WHERE status = 'PENDING' AND scheduled_at <= NOW()
    @Index(name = "idx_email_task_status_scheduled", columnList = "status, scheduled_at"),
    // Rate-limit query: WHERE user_id = ? AND created_at >= ?
    @Index(name = "idx_email_task_user_created", columnList = "user_id, created_at"),
    // Duplicate-prevention: unique constraint on idempotency key
    @Index(name = "idx_email_task_idempotency", columnList = "idempotency_key", unique = true)
})
public class EmailTask {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "recipient_email", nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;

    @Column(name = "resume_url")
    private String resumeUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private EmailStatus status = EmailStatus.PENDING;

    @Column(name = "retry_count")
    private int retryCount = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    /**
     * Prevents duplicate email sends. Generated from:
     * SHA256(userId + recipientEmail + subject + date)
     * Two identical requests on the same day will be rejected.
     */
    @Column(name = "idempotency_key", unique = true, length = 64)
    private String idempotencyKey;

    /**
     * Timestamp when a worker claimed this task.
     * Used to detect stuck tasks (processing > 5 min = stale).
     */
    @Column(name = "claimed_at")
    private LocalDateTime claimedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
