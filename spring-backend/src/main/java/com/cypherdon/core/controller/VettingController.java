package com.cypherdon.core.controller;

import com.cypherdon.core.config.TenantContext;
import com.cypherdon.core.model.Tenant;
import com.cypherdon.core.model.VettingTask;
import com.cypherdon.core.repository.TenantRepository;
import com.cypherdon.core.repository.VettingTaskRepository;
import com.cypherdon.core.service.AsyncVettingService;
import com.cypherdon.core.service.LedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vetting")
@CrossOrigin(origins = "*")
public class VettingController {

    @Autowired
    private VettingTaskRepository vettingTaskRepository;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private LedgerService ledgerService;

    @Autowired
    private AsyncVettingService asyncVettingService;

    private static final BigDecimal VETTING_COST = new BigDecimal("1.00");

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "target_role", defaultValue = "Software Engineer") String targetRole) {

        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"error\": \"Tenant context missing\"}");
        }

        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        if (tenant == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{\"error\": \"Tenant not found\"}");
        }

        // 1. Verify and deduct credit
        boolean success = ledgerService.deductCredits(tenantId, VETTING_COST, "AI Resume Vetting: " + file.getOriginalFilename());
        if (!success) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED)
                    .body("{\"error\": \"Insufficient credits. Please top up your wallet.\"}");
        }

        // 2. Create Vetting Task in QUEUED state
        VettingTask task = new VettingTask();
        task.setTenant(tenant);
        task.setFileName(file.getOriginalFilename());
        task.setStatus("QUEUED");
        VettingTask savedTask = vettingTaskRepository.save(task);

        // 3. Trigger Async Vetting worker
        try {
            asyncVettingService.processVettingTask(
                    savedTask.getId(),
                    file.getBytes(),
                    file.getOriginalFilename(),
                    targetRole,
                    tenantId
            );
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Failed to read file upload payload\"}");
        }

        return ResponseEntity.ok(savedTask);
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<VettingTask>> getTasks() {
        UUID tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(vettingTaskRepository.findByTenantId(tenantId));
    }

    @GetMapping("/tasks/{taskId}")
    public ResponseEntity<VettingTask> getTask(@PathVariable UUID taskId) {
        return vettingTaskRepository.findById(taskId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
