package com.cypherdon.core.controller;

import com.cypherdon.core.service.AiIntegrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/ai")
public class AiProxyController {

    @Autowired
    private AiIntegrationService aiIntegrationService;

    // Security is handled by InternalApiKeyFilter
    @PostMapping(value = "/analyze-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<String>> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "target_role", defaultValue = "Software Engineer") String targetRole) {

        return aiIntegrationService.analyzeResumeAsync(file, targetRole)
                .map(responseJson -> ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(responseJson));
    }
}
