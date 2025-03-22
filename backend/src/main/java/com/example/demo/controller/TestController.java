package com.example.demo.controller;

import com.example.demo.dto.RecommendationResponse;
import com.example.demo.model.TestResult;
import com.example.demo.service.MLService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TestController {
    private final MLService mlService;
    
    @Autowired
    public TestController(MLService mlService) {
        this.mlService = mlService;
    }
    
    @PostMapping("/submit-test")
    public ResponseEntity<?> submitTest(@RequestBody List<TestResult> results) {
        RecommendationResponse recommendation = mlService.generateRecommendation(results);
        return ResponseEntity.ok(recommendation);
    }
}
