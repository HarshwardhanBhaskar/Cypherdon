package com.cypherdon.core.service;

import com.cypherdon.core.dto.JobDto;
import com.cypherdon.core.model.Job;
import com.cypherdon.core.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(JobDto jobDto) {
        Job job = new Job();
        job.setTitle(jobDto.getTitle());
        job.setCompany(jobDto.getCompany());
        job.setDescription(jobDto.getDescription());
        job.setLocation(jobDto.getLocation());
        job.setRole(jobDto.getRole());
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAll();
    }
}
