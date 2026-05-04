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
     * Fetches tasks ready to process, ordered by scheduled_at.
     * Uses the composite index (status, scheduled_at).
     */
    @Query("SELECT e FROM EmailTask e WHERE e.status = :status AND e.scheduledAt <= :now ORDER BY e.scheduledAt ASC")
    List<EmailTask> findTasksToProcess(EmailStatus status, LocalDateTime now, Pageable pageable);

    /**
     * Rate-limit check: counts emails queued today by a user.
     * Uses the composite index (user_id, created_at).
     */
    @Query("SELECT COUNT(e) FROM EmailTask e WHERE e.userId = :userId AND e.createdAt >= :startOfDay")
    long countEmailsSentToday(UUID userId, LocalDateTime startOfDay);

    /**
     * Batch-update status for multiple tasks in a single round-trip.
     * Avoids N individual save() calls for bulk operations.
     */
    @Modifying
    @Query("UPDATE EmailTask e SET e.status = :status, e.sentAt = :now WHERE e.id IN :ids")
    int batchUpdateStatus(List<UUID> ids, EmailStatus status, LocalDateTime now);

    /**
     * Count tasks by status for monitoring/dashboard.
     */
    long countByStatus(EmailStatus status);
}
