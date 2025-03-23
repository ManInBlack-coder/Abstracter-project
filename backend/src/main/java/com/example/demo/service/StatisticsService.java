package com.example.demo.service;

import com.example.demo.model.TestResult;
import com.example.demo.repository.TestResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private TestResultRepository testResultRepository;

    public Map<String, Double> calculateUserCategoryAverages(UUID userId) {
        List<TestResult> userResults = testResultRepository.findByUserId(userId);
        
        return userResults.stream()
            .collect(Collectors.groupingBy(
                TestResult::getQuestionType,
                Collectors.averagingDouble(result -> result.getCorrect() ? 1.0 : 0.0)
            ));
    }

    public Map<String, Double> calculateUserTimeAverages(UUID userId) {
        List<TestResult> userResults = testResultRepository.findByUserId(userId);
        
        return userResults.stream()
            .collect(Collectors.groupingBy(
                TestResult::getQuestionType,
                Collectors.averagingDouble(TestResult::getTimeTaken)
            ));
    }

    public Map<String, Double> calculateRecentProgress(UUID userId, int daysBack) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysBack);
        List<TestResult> recentResults = testResultRepository.findByUserIdAndTimestampAfter(userId, cutoffDate);
        
        return recentResults.stream()
            .collect(Collectors.groupingBy(
                TestResult::getQuestionType,
                Collectors.averagingDouble(result -> result.getCorrect() ? 1.0 : 0.0)
            ));
    }

    public Map<String, Integer> getQuestionTypeDistribution(UUID userId) {
        List<TestResult> userResults = testResultRepository.findByUserId(userId);
        
        return userResults.stream()
            .collect(Collectors.groupingBy(
                TestResult::getQuestionType,
                Collectors.collectingAndThen(
                    Collectors.counting(),
                    Long::intValue
                )
            ));
    }
} 