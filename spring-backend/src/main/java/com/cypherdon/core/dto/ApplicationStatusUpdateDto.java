package com.cypherdon.core.dto;

import com.cypherdon.core.model.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationStatusUpdateDto {
    @NotNull(message = "Status is required")
    private ApplicationStatus status;
}
