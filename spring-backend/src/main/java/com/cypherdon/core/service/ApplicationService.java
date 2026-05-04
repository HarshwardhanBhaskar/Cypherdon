package com.cypherdon.core.service;

import com.cypherdon.core.dto.ApplicationRequestDto;
import com.cypherdon.core.dto.ApplicationResponseDto;
import com.cypherdon.core.dto.ApplicationStatusUpdateDto;
import com.cypherdon.core.model.Application;
import com.cypherdon.core.model.Job;
import com.cypherdon.core.model.User;
import com.cypherdon.core.repository.ApplicationRepository;
import com.cypherdon.core.repository.JobRepository;
import com.cypherdon.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    public ApplicationResponseDto applyForJob(UUID userId, ApplicationRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        Application application = new Application();
        application.setUser(user);
        application.setJob(job);
        
        Application saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    public List<ApplicationResponseDto> getUserApplications(UUID userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ApplicationResponseDto updateApplicationStatus(UUID applicationId, ApplicationStatusUpdateDto updateDto) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.setStatus(updateDto.getStatus());
        Application saved = applicationRepository.save(application);
        return mapToDto(saved);
    }

    private ApplicationResponseDto mapToDto(Application app) {
        ApplicationResponseDto dto = new ApplicationResponseDto();
        dto.setId(app.getId());
        dto.setUserId(app.getUser().getId());
        dto.setJobId(app.getJob().getId());
        dto.setJobTitle(app.getJob().getTitle());
        dto.setCompany(app.getJob().getCompany());
        dto.setStatus(app.getStatus());
        dto.setAppliedAt(app.getAppliedAt());
        return dto;
    }
}
