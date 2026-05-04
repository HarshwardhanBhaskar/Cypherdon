package com.cypherdon.core.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    private UUID id; // Matches auth.users UUID in Supabase

    private String email;

    @Column(name = "full_name")
    private String fullName;

    private String phone;

    // Using Hibernate's List mapping for PostgreSQL arrays
    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "text[]")
    private List<String> skills;

    @Column(name = "experience_level")
    private String experienceLevel;

    @Column(name = "resume_url")
    private String resumeUrl;

    private String address;
    private String city;
    private String country;

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Convert(converter = StringListConverter.class)
    @Column(name = "languages_known", columnDefinition = "text[]")
    private List<String> languagesKnown;

    @Column(name = "preferred_role")
    private String preferredRole;

    @Column(name = "preferred_location")
    private String preferredLocation;

    @Column(name = "job_type")
    private String jobType;

    @Column(name = "salary_expectation")
    private String salaryExpectation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
