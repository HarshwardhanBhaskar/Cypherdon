package com.cypherdon.core.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class QueueEmailRequest {
    private UUID userId; // Optional for internal calls, or explicitly passed
    
    @NotBlank
    @Email
    private String recipientEmail;
    
    @NotBlank
    private String subject;
    
    @NotBlank
    private String body;
    
    private String resumeUrl;
    
    private boolean isPaidUser = false;
}
