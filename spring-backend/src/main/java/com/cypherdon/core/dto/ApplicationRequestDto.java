package com.cypherdon.core.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ApplicationRequestDto {
    @NotNull(message = "Job ID is required")
    private UUID jobId;
}
