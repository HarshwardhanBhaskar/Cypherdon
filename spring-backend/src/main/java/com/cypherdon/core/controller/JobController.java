package com.cypherdon.core.controller;

import com.cypherdon.core.dto.JobDto;
import com.cypherdon.core.model.Job;
import com.cypherdon.core.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping("/save")
    public ResponseEntity<Job> createJob(@Valid @RequestBody JobDto jobDto) {
        Job savedJob = jobService.createJob(jobDto);
        return ResponseEntity.ok(savedJob);
    }

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }
}
