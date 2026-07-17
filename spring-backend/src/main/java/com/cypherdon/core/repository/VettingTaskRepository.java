package com.cypherdon.core.repository;

import com.cypherdon.core.model.VettingTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VettingTaskRepository extends JpaRepository<VettingTask, UUID> {
    List<VettingTask> findByTenantId(UUID tenantId);
}
