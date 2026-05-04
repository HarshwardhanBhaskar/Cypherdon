package com.cypherdon.core.controller;

import com.cypherdon.core.dto.ApplicationRequestDto;
import com.cypherdon.core.dto.ApplicationResponseDto;
import com.cypherdon.core.dto.ApplicationStatusUpdateDto;
import com.cypherdon.core.service.ApplicationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponseDto> applyForJob(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ApplicationRequestDto requestDto) {
        UUID userId = UUID.fromString(jwt.getSubject());
        ApplicationResponseDto response = applicationService.applyForJob(userId, requestDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponseDto>> getUserApplications(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<ApplicationResponseDto> applications = applicationService.getUserApplications(userId);
        return ResponseEntity.ok(applications);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDto> updateApplicationStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ApplicationStatusUpdateDto updateDto) {
        ApplicationResponseDto response = applicationService.updateApplicationStatus(id, updateDto);
        return ResponseEntity.ok(response);
    }
}
