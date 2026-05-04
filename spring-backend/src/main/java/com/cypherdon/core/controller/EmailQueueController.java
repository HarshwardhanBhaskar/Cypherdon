package com.cypherdon.core.controller;

import com.cypherdon.core.dto.QueueEmailRequest;
import com.cypherdon.core.model.EmailTask;
import com.cypherdon.core.service.EmailQueueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/emails")
public class EmailQueueController {

    @Autowired
    private EmailQueueService emailQueueService;

    // Security is handled by InternalApiKeyFilter
    @PostMapping("/queue")
    public ResponseEntity<?> queueEmail(@Valid @RequestBody QueueEmailRequest request) {
        try {
            UUID userId = request.getUserId() != null ? request.getUserId() : UUID.randomUUID();

            EmailTask task = emailQueueService.queueEmail(
                    userId,
                    request.getRecipientEmail(),
                    request.getSubject(),
                    request.getBody(),
                    request.getResumeUrl(),
                    request.isPaidUser()
            );

            return ResponseEntity.ok(task);

        } catch (EmailQueueService.DuplicateEmailException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (EmailQueueService.RateLimitExceededException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
