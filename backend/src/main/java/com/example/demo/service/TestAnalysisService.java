package com.example.demo.service;

import com.example.demo.model.TestSessionResult;
import com.example.demo.model.CategoryTimingResult;
import com.example.demo.model.TestResult;
import com.example.demo.dto.CategoryStatsDTO;
import com.example.demo.repository.TestSessionResultRepository;
import com.example.demo.repository.CategoryTimingResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TestAnalysisService {
    
    @Autowired
    private TestSessionResultRepository testSessionResultRepository;
    
    @Autowired
    private CategoryTimingResultRepository categoryTimingResultRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Transactional
    public TestSessionResult analyzeAndSaveResults(UUID userId, List<TestResult> results) {
        // Grupeeri tulemused kategooriate järgi
        Map<String, List<TestResult>> resultsByCategory = results.stream()
            .collect(Collectors.groupingBy(TestResult::getQuestionType));

        // Loo uus testi sessiooni tulemus
        TestSessionResult sessionResult = new TestSessionResult();
        sessionResult.setUserId(userId);
        sessionResult.setSessionTimestamp(LocalDateTime.now());
        sessionResult.setTotalQuestions(results.size());

        // Arvuta protsendid iga kategooria jaoks
        calculatePercentages(sessionResult, resultsByCategory);
        
        // Salvesta sessiooni tulemus
        sessionResult = testSessionResultRepository.save(sessionResult);
        
        // Arvuta ja salvesta ajaarvestused
        saveTimingResults(sessionResult.getId(), resultsByCategory);

        return sessionResult;
    }

    private void calculatePercentages(TestSessionResult sessionResult, Map<String, List<TestResult>> resultsByCategory) {
        resultsByCategory.forEach((category, categoryResults) -> {
            double correctCount = categoryResults.stream()
                .filter(result -> Boolean.TRUE.equals(result.getCorrect()))
                .count();
            double percentage = (correctCount / categoryResults.size()) * 100;

            switch (category) {
                case "SEQUENCE":
                    sessionResult.setSequencePercentage(percentage);
                    break;
                case "PATTERN":
                    sessionResult.setPatternPercentage(percentage);
                    break;
                case "ANALOGY":
                    sessionResult.setAnalogyPercentage(percentage);
                    break;
                case "CATEGORIZATION":
                    sessionResult.setCategorizationPercentage(percentage);
                    break;
            }
        });
    }

    private void saveTimingResults(UUID sessionId, Map<String, List<TestResult>> resultsByCategory) {
        resultsByCategory.forEach((category, categoryResults) -> {
            double averageTime = categoryResults.stream()
                .mapToDouble(TestResult::getTimeTaken)
                .average()
                .orElse(0.0);

            CategoryTimingResult timingResult = new CategoryTimingResult();
            timingResult.setSessionId(sessionId);
            timingResult.setCategory(category);
            timingResult.setAverageTimeSeconds(averageTime);
            timingResult.setQuestionCount(categoryResults.size());

            categoryTimingResultRepository.save(timingResult);
        });
    }

    public List<TestSessionResult> getUserTestHistory(UUID userId) {
        return testSessionResultRepository.findByUserIdOrderBySessionTimestampDesc(userId);
    }

    public List<CategoryTimingResult> getSessionTimings(UUID sessionId) {
        return categoryTimingResultRepository.findBySessionId(sessionId);
    }

    @Transactional(readOnly = true)
    public List<CategoryStatsDTO> calculateUserStats(UUID userId) {
        List<TestSessionResult> userSessions = testSessionResultRepository.findByUserIdOrderBySessionTimestampDesc(userId);
        
        if (userSessions.isEmpty()) {
            return Collections.emptyList();
        }

        List<CategoryStatsDTO> stats = new ArrayList<>();
        
        // SEQUENCE statistika
        double avgSequence = userSessions.stream()
            .filter(s -> s.getSequencePercentage() != null)
            .mapToDouble(TestSessionResult::getSequencePercentage)
            .average()
            .orElse(0.0);
            
        // PATTERN statistika
        double avgPattern = userSessions.stream()
            .filter(s -> s.getPatternPercentage() != null)
            .mapToDouble(TestSessionResult::getPatternPercentage)
            .average()
            .orElse(0.0);
            
        // ANALOGY statistika
        double avgAnalogy = userSessions.stream()
            .filter(s -> s.getAnalogyPercentage() != null)
            .mapToDouble(TestSessionResult::getAnalogyPercentage)
            .average()
            .orElse(0.0);
            
        // CATEGORIZATION statistika
        double avgCategorization = userSessions.stream()
            .filter(s -> s.getCategorizationPercentage() != null)
            .mapToDouble(TestSessionResult::getCategorizationPercentage)
            .average()
            .orElse(0.0);

        // Keskmised ajad kategooriate kaupa
        Map<String, Double> avgTimes = new HashMap<>();
        Map<String, Integer> counts = new HashMap<>();
        
        for (TestSessionResult session : userSessions) {
            List<CategoryTimingResult> timings = categoryTimingResultRepository.findBySessionId(session.getId());
            for (CategoryTimingResult timing : timings) {
                String category = timing.getCategory();
                avgTimes.merge(category, timing.getAverageTimeSeconds(), Double::sum);
                counts.merge(category, 1, Integer::sum);
            }
        }

        // Lisa statistika objektid
        stats.add(new CategoryStatsDTO("SEQUENCE", avgSequence, 
            avgTimes.getOrDefault("SEQUENCE", 0.0) / counts.getOrDefault("SEQUENCE", 1),
            counts.getOrDefault("SEQUENCE", 0)));
            
        stats.add(new CategoryStatsDTO("PATTERN", avgPattern,
            avgTimes.getOrDefault("PATTERN", 0.0) / counts.getOrDefault("PATTERN", 1),
            counts.getOrDefault("PATTERN", 0)));
            
        stats.add(new CategoryStatsDTO("ANALOGY", avgAnalogy,
            avgTimes.getOrDefault("ANALOGY", 0.0) / counts.getOrDefault("ANALOGY", 1),
            counts.getOrDefault("ANALOGY", 0)));
            
        stats.add(new CategoryStatsDTO("CATEGORIZATION", avgCategorization,
            avgTimes.getOrDefault("CATEGORIZATION", 0.0) / counts.getOrDefault("CATEGORIZATION", 1),
            counts.getOrDefault("CATEGORIZATION", 0)));

        // Saada statistika WebSocket kaudu
        messagingTemplate.convertAndSend("/topic/stats/" + userId, stats);
        
        return stats;
    }
} 