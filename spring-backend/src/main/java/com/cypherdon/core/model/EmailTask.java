package com.cypherdon.core.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "email_tasks", indexes = {
    // Index for the worker query: WHERE status = ? AND scheduled_at <= ? ORDER BY scheduled_at
    @Index(name = "idx_email_task_status_scheduled", columnList = "status, scheduled_at"),
    // Index for the rate-limit query: WHERE user_id = ? AND created_at >= ?
    @Index(name = "idx_email_task_user_created", columnList = "user_id, created_at")
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
    @Column(nullable = false, length = 10)
    private EmailStatus status = EmailStatus.PENDING;

    @Column(name = "retry_count")
    private int retryCount = 0;

    @Column(name = "error_message")
    private String errorMessage; // Captures the last failure reason

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt; // Track when email was actually sent

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
