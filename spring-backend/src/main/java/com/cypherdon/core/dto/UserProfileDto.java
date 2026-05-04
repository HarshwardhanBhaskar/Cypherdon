package com.cypherdon.core.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserProfileDto {
    private String fullName;
    private String phone;
    private List<String> skills;
    private String experienceLevel;
    private String resumeUrl;
    private String address;
    private String city;
    private String country;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private List<String> languagesKnown;
    private String preferredRole;
    private String preferredLocation;
    private String jobType;
    private String salaryExpectation;
}
