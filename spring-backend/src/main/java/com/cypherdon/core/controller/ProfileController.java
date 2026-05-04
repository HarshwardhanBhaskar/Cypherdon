package com.cypherdon.core.controller;

import com.cypherdon.core.dto.UserProfileDto;
import com.cypherdon.core.model.User;
import com.cypherdon.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*") // Allows your Next.js app to connect
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal Jwt jwt) {
        // Supabase stores the user's UUID in the JWT "sub" claim
        UUID userId = UUID.fromString(jwt.getSubject());
        
        return userRepository.findById(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UserProfileDto dto) {
        UUID userId = UUID.fromString(jwt.getSubject());

        return userRepository.findById(userId)
                .map(user -> {
                    // Update only fields that are provided
                    if (dto.getFullName() != null) user.setFullName(dto.getFullName());
                    if (dto.getPhone() != null) user.setPhone(dto.getPhone());
                    if (dto.getSkills() != null) user.setSkills(dto.getSkills());
                    if (dto.getExperienceLevel() != null) user.setExperienceLevel(dto.getExperienceLevel());
                    if (dto.getResumeUrl() != null) user.setResumeUrl(dto.getResumeUrl());
                    if (dto.getAddress() != null) user.setAddress(dto.getAddress());
                    if (dto.getCity() != null) user.setCity(dto.getCity());
                    if (dto.getCountry() != null) user.setCountry(dto.getCountry());
                    if (dto.getLinkedinUrl() != null) user.setLinkedinUrl(dto.getLinkedinUrl());
                    if (dto.getGithubUrl() != null) user.setGithubUrl(dto.getGithubUrl());
                    if (dto.getPortfolioUrl() != null) user.setPortfolioUrl(dto.getPortfolioUrl());
                    if (dto.getLanguagesKnown() != null) user.setLanguagesKnown(dto.getLanguagesKnown());
                    if (dto.getPreferredRole() != null) user.setPreferredRole(dto.getPreferredRole());
                    if (dto.getPreferredLocation() != null) user.setPreferredLocation(dto.getPreferredLocation());
                    if (dto.getJobType() != null) user.setJobType(dto.getJobType());
                    if (dto.getSalaryExpectation() != null) user.setSalaryExpectation(dto.getSalaryExpectation());

                    User updatedUser = userRepository.save(user);
                    return ResponseEntity.ok(updatedUser);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
