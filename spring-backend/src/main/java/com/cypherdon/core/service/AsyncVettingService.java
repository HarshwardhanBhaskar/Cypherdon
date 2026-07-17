package com.cypherdon.core.service;

import com.cypherdon.core.config.VettingWebSocketHandler;
import com.cypherdon.core.model.VettingTask;
import com.cypherdon.core.repository.VettingTaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AsyncVettingService {

    @Autowired
    private VettingTaskRepository vettingTaskRepository;

    @Autowired
    private AiIntegrationService aiIntegrationService;

    @Autowired
    private VettingWebSocketHandler vettingWebSocketHandler;

    @Async
    public void processVettingTask(UUID taskId, byte[] fileBytes, String fileName, String targetRole, UUID tenantId) {
        VettingTask task = vettingTaskRepository.findById(taskId).orElse(null);
        if (task == null) {
            return;
        }

        try {
            // Update status to PROCESSING
            task.setStatus("PROCESSING");
            vettingTaskRepository.save(task);

            // Broadcast status via WebSocket
            broadcastStatus(tenantId, taskId, "PROCESSING", null);

            // Call FastAPI resume analyzer (blocking on Mono since we are running in @Async background thread)
            String result = aiIntegrationService.analyzeResumeBytes(fileBytes, fileName, targetRole).block();

            // Update status to COMPLETED
            task.setStatus("COMPLETED");
            task.setResultPayload(result);
            vettingTaskRepository.save(task);

            // Broadcast success via WebSocket
            broadcastStatus(tenantId, taskId, "COMPLETED", result);

        } catch (Exception e) {
            task.setStatus("FAILED");
            task.setResultPayload("{\"error\": \"" + e.getMessage() + "\"}");
            vettingTaskRepository.save(task);

            // Broadcast failure via WebSocket
            broadcastStatus(tenantId, taskId, "FAILED", task.getResultPayload());
        }
    }

    private void broadcastStatus(UUID tenantId, UUID taskId, String status, String payload) {
        String destinationTenant = tenantId.toString();
        String message = String.format("{\"taskId\":\"%s\",\"status\":\"%s\",\"result\":%s}", 
                taskId.toString(), 
                status, 
                payload != null && !payload.isEmpty() ? payload : "null");
        vettingWebSocketHandler.sendStatusUpdate(destinationTenant, message);
    }
}
