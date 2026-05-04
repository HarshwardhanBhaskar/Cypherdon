package com.cypherdon.core.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.IOException;

@Service
public class AiIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AiIntegrationService.class);

    private final WebClient webClient;

    public AiIntegrationService(WebClient.Builder webClientBuilder, 
                                @Value("${cypherdon.fastapi.url:http://localhost:8000}") String fastApiUrl) {
        this.webClient = webClientBuilder.baseUrl(fastApiUrl).build();
    }

    @CircuitBreaker(name = "aiEngine", fallbackMethod = "fallbackAnalysis")
    @Retry(name = "aiEngine")
    public Mono<String> analyzeResumeAsync(MultipartFile file, String targetRole) {
        try {
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume.pdf";
                }
            });
            builder.part("target_role", targetRole);

            logger.info("Forwarding async resume analysis to FastAPI...");

            return webClient.post()
                    .uri("/api/resume/analyze")
                    // Note: In a real distributed system, we'd generate a short-lived JWT here instead of a static key
                    .header("X-Internal-Secret", System.getenv().getOrDefault("INTERNAL_SERVICE_KEY", "cypherdon_internal_123"))
                    .body(BodyInserters.fromMultipartData(builder.build()))
                    .retrieve()
                    .bodyToMono(String.class);

        } catch (IOException e) {
            return Mono.error(new RuntimeException("Failed to read uploaded file", e));
        }
    }

    public Mono<String> fallbackAnalysis(MultipartFile file, String targetRole, Throwable t) {
        logger.error("AI Engine Circuit Breaker Open / Retries Exhausted: {}", t.getMessage());
        return Mono.just("{\"score\": 0, \"error\": \"AI Engine is currently overloaded or unavailable. Circuit breaker activated.\", \"missing_skills\": [], \"suggestions\": []}");
    }
}
