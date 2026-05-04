package com.cypherdon.core.model;

public enum EmailStatus {
    PENDING,     // Queued, waiting for scheduled_at
    PROCESSING,  // Claimed by a worker, actively being sent (prevents duplicates)
    SENT,        // Successfully delivered via SMTP
    FAILED,      // Permanently failed after max retries
    CANCELLED    // Manually cancelled by user or system
}
