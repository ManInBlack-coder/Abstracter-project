package com.example.demo.service;

import com.example.demo.dto.MLRequest;
import com.example.demo.dto.RecommendationResponse;
import com.example.demo.model.TestResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class MLService {
    private final String ML_SERVICE_URL = "http://localhost:5001";
    private final RestTemplate restTemplate;
    
    public MLService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public RecommendationResponse generateRecommendation(List<TestResult> userResults) {
        MLRequest request = new MLRequest(userResults);
        return restTemplate.postForObject(
            ML_SERVICE_URL + "/predict",
            request,
            RecommendationResponse.class
        );
    }
} 