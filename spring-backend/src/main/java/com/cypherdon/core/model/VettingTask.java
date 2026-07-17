package com.cypherdon.core.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "vetting_tasks", indexes = {
    @Index(name = "idx_vetting_tasks_tenant", columnList = "tenant_id"),
    @Index(name = "idx_vetting_tasks_status", columnList = "status")
})
public class VettingTask {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String status = "QUEUED"; // "QUEUED", "PROCESSING", "COMPLETED", "FAILED"

    @Column(name = "result_payload", columnDefinition = "TEXT")
    private String resultPayload;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
