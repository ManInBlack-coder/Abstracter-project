package com.example.demo.controller;

import com.example.demo.service.StatisticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/statistics")
@CrossOrigin(origins = "*")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStatistics(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "30") int days) {
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("categoryAverages", statisticsService.calculateUserCategoryAverages(userId));
        statistics.put("timeAverages", statisticsService.calculateUserTimeAverages(userId));
        statistics.put("recentProgress", statisticsService.calculateRecentProgress(userId, days));
        statistics.put("questionDistribution", statisticsService.getQuestionTypeDistribution(userId));
        
        return ResponseEntity.ok(statistics);
    }
} 