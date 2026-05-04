package com.cypherdon.core.repository;

import com.cypherdon.core.model.EmailStatus;
import com.cypherdon.core.model.EmailTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface EmailTaskRepository extends JpaRepository<EmailTask, UUID> {

    /**
     * CORE QUEUE QUERY — Atomic claim with row-level locking.
     *
     * FOR UPDATE  → locks the selected rows so no other worker can grab them
     * SKIP LOCKED → if another worker already locked a row, skip it instead of waiting
     *
     * This eliminates duplicate processing across multiple worker instances.
     * Uses composite index (status, scheduled_at).
     */
    @Query(value = "SELECT * FROM email_tasks " +
            "WHERE status = 'PENDING' AND scheduled_at <= :now " +
            "ORDER BY scheduled_at ASC " +
            "LIMIT :batchSize " +
            "FOR UPDATE SKIP LOCKED",
            nativeQuery = true)
    List<EmailTask> claimNextBatch(LocalDateTime now, int batchSize);

    /**
     * Rate-limit check: counts emails queued today by a user.
     * Uses composite index (user_id, created_at).
     */
    @Query("SELECT COUNT(e) FROM EmailTask e WHERE e.userId = :userId AND e.createdAt >= :startOfDay")
    long countEmailsSentToday(UUID userId, LocalDateTime startOfDay);

    /**
     * Batch transition: PENDING → PROCESSING (atomic claim).
     */
    @Modifying
    @Query("UPDATE EmailTask e SET e.status = 'PROCESSING', e.claimedAt = :now WHERE e.id IN :ids AND e.status = 'PENDING'")
    int claimTasks(List<UUID> ids, LocalDateTime now);

    /**
     * Batch transition: PROCESSING → SENT.
     */
    @Modifying
    @Query("UPDATE EmailTask e SET e.status = 'SENT', e.sentAt = :now, e.errorMessage = null WHERE e.id IN :ids")
    int markSent(List<UUID> ids, LocalDateTime now);

    /**
     * Recovery: find tasks stuck in PROCESSING for too long (worker crashed).
     * Reset them to PENDING so they can be re-claimed.
     */
    @Modifying
    @Query("UPDATE EmailTask e SET e.status = 'PENDING', e.claimedAt = null " +
            "WHERE e.status = 'PROCESSING' AND e.claimedAt < :staleCutoff")
    int recoverStaleTasks(LocalDateTime staleCutoff);

    /**
     * Count tasks by status for monitoring dashboard.
     */
    long countByStatus(EmailStatus status);

    /**
     * Check if an idempotency key already exists (duplicate prevention).
     */
    boolean existsByIdempotencyKey(String idempotencyKey);
}
