package com.cypherdon.core.dto;

import com.cypherdon.core.model.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ApplicationResponseDto {
    private UUID id;
    private UUID userId;
    
    // Flattening job details for easier frontend consumption
    private UUID jobId;
    private String jobTitle;
    private String company;
    
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
}
