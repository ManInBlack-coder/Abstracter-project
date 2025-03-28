package com.example.demo.controller;

import com.example.demo.dto.RecommendationResponse;
import com.example.demo.dto.TestSubmissionRequest;
import com.example.demo.model.TestResult;
import com.example.demo.model.UserRecommendation;
import com.example.demo.service.MLService;
import com.example.demo.repository.TestResultRepository;
import com.example.demo.repository.UserRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.demo.dto.CategoryStatsDTO;
import com.example.demo.service.TestAnalysisService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TestController {

    @Autowired
    private TestResultRepository testResultRepository;

    @Autowired
    private UserRecommendationRepository recommendationRepository;

    @Autowired
    private MLService mlService;

    @Autowired
    private TestAnalysisService testAnalysisService;

    @PostMapping("/submit-test")
    public ResponseEntity<?> submitTest(@RequestBody TestSubmissionRequest request) {
        try {
            // Salvesta testitulemused
            List<TestResult> results = request.getResults().stream()
                .map(result -> {
                    TestResult testResult = new TestResult();
                    testResult.setUserId(UUID.fromString(request.getUserId()));
                    testResult.setQuestionType(result.getQuestionType());
                    testResult.setCorrect(result.getCorrect());
                    testResult.setTimeTaken(result.getTimeTaken());
                    testResult.setTimestamp(LocalDateTime.now());
                    return testResult;
                })
                .collect(Collectors.toList());

            testResultRepository.saveAll(results);

            // Analüüsi ja salvesta sessiooni tulemused
            UUID userId = UUID.fromString(request.getUserId());
            testAnalysisService.analyzeAndSaveResults(userId, results);

            // Küsi soovitused ML teenuselt
            RecommendationResponse mlResponse = mlService.generateRecommendation(results);

            // Kontrolli kas kasutajal on juba soovitus olemas
            Optional<UserRecommendation> existingRecommendation = 
                recommendationRepository.findFirstByUserIdOrderByTimestampDesc(userId);

            UserRecommendation recommendation;
            if (existingRecommendation.isPresent()) {
                // Uuenda olemasolevat soovitust
                recommendation = existingRecommendation.get();
                recommendation.setConfidenceScore(mlResponse.getConfidenceScore());
                
                // Kasuta uusi välju, kui need on olemas, muidu kasuta vanu
                if (mlResponse.getRecommendationType() != null) {
                    recommendation.setRecommendationType(mlResponse.getRecommendationType());
                } else if (mlResponse.getStrengths() != null && !mlResponse.getStrengths().isEmpty()) {
                    recommendation.setRecommendationType(String.join(", ", mlResponse.getStrengths()));
                }
                
                if (mlResponse.getRecommendationText() != null) {
                    recommendation.setRecommendationText(mlResponse.getRecommendationText());
                } else if (mlResponse.getRecommendations() != null && !mlResponse.getRecommendations().isEmpty()) {
                    recommendation.setRecommendationText(String.join(", ", mlResponse.getRecommendations()));
                }
                
                recommendation.setTimestamp(LocalDateTime.now());
            } else {
                // Loo uus soovitus
                recommendation = new UserRecommendation();
                recommendation.setUserId(userId);
                recommendation.setConfidenceScore(mlResponse.getConfidenceScore());
                
                // Kasuta uusi välju, kui need on olemas, muidu kasuta vanu
                if (mlResponse.getRecommendationType() != null) {
                    recommendation.setRecommendationType(mlResponse.getRecommendationType());
                } else if (mlResponse.getStrengths() != null && !mlResponse.getStrengths().isEmpty()) {
                    recommendation.setRecommendationType(String.join(", ", mlResponse.getStrengths()));
                }
                
                if (mlResponse.getRecommendationText() != null) {
                    recommendation.setRecommendationText(mlResponse.getRecommendationText());
                } else if (mlResponse.getRecommendations() != null && !mlResponse.getRecommendations().isEmpty()) {
                    recommendation.setRecommendationText(String.join(", ", mlResponse.getRecommendations()));
                }
                
                recommendation.setTimestamp(LocalDateTime.now());
            }

            // Salvesta soovitus andmebaasi
            recommendationRepository.save(recommendation);

            return ResponseEntity.ok(mlResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing test results: " + e.getMessage());
        }
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<List<CategoryStatsDTO>> getUserStats(@PathVariable UUID userId) {
        List<CategoryStatsDTO> stats = testAnalysisService.calculateUserStats(userId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recommendation/{userId}")
    public ResponseEntity<UserRecommendation> getLatestRecommendation(@PathVariable UUID userId) {
        return recommendationRepository.findFirstByUserIdOrderByTimestampDesc(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
