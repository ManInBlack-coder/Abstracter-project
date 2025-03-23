package com.example.demo.dto;

public class CategoryStatsDTO {
    private String category;
    private Double averagePercentage;
    private Double averageTimeSeconds;
    private Integer totalAttempts;

    public CategoryStatsDTO(String category, Double averagePercentage, Double averageTimeSeconds, Integer totalAttempts) {
        this.category = category;
        this.averagePercentage = averagePercentage;
        this.averageTimeSeconds = averageTimeSeconds;
        this.totalAttempts = totalAttempts;
    }

    // Getters and Setters
    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getAveragePercentage() {
        return averagePercentage;
    }

    public void setAveragePercentage(Double averagePercentage) {
        this.averagePercentage = averagePercentage;
    }

    public Double getAverageTimeSeconds() {
        return averageTimeSeconds;
    }

    public void setAverageTimeSeconds(Double averageTimeSeconds) {
        this.averageTimeSeconds = averageTimeSeconds;
    }

    public Integer getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }
} 