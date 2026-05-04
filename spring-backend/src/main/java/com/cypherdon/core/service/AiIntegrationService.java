package com.cypherdon.core.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AiIntegrationService.class);

    @Value("${cypherdon.fastapi.url:http://localhost:8000}")
    private String fastApiUrl;

    // RestTemplate with explicit connect/read timeouts to prevent thread pool exhaustion
    private final RestTemplate restTemplate;

    public AiIntegrationService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);  // 5 seconds to connect
        factory.setReadTimeout(15000);    // 15 seconds to read (AI can be slow)
        this.restTemplate = new RestTemplate(factory);
    }

    public String analyzeResume(MultipartFile file, String targetRole) {
        try {
            String url = fastApiUrl + "/api/resume/analyze";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            ByteArrayResource fileAsResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };

            body.add("file", fileAsResource);
            body.add("target_role", targetRole);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            logger.info("Forwarding resume to FastAPI AI engine at {}", url);
            ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);

            return response.getBody();

        } catch (Exception e) {
            logger.error("Failed to communicate with FastAPI: {}", e.getMessage());
            // Return a graceful fallback instead of crashing the frontend
            return "{\"score\": 0, \"error\": \"AI Engine is currently unavailable. Please try again later.\", \"missing_skills\": [], \"suggestions\": []}";
        }
    }
}
