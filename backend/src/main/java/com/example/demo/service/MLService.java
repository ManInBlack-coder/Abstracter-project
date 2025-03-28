package com.example.demo.service;

import com.example.demo.dto.MLRequest;
import com.example.demo.dto.RecommendationResponse;
import com.example.demo.model.TestResult;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.UUID;

@Service
public class MLService {
    private final String ML_SERVICE_URL = "http://localhost:5001";
    private final RestTemplate restTemplate;
    
    public MLService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    public RecommendationResponse generateRecommendation(List<TestResult> userResults) {
        // Võtame userId esimesest tulemusest, eeldades et kõik tulemused on sama kasutaja omad
        UUID userId = userResults.get(0).getUserId();
        
        // Loome ML päringu objekti
        MLRequest request = new MLRequest(userResults, userId.toString());
        
        // Saadame päringu ML teenusele
        return restTemplate.postForObject(
            ML_SERVICE_URL + "/predict",
            request,
            RecommendationResponse.class
        );
    }
} 