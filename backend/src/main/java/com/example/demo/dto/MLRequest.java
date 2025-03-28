package com.example.demo.dto;

import com.example.demo.model.TestResult;
import java.util.List;

public class MLRequest {
    private List<TestResult> results;
    private String userId;

    public MLRequest(List<TestResult> results) {
        this.results = results;
    }
    
    public MLRequest(List<TestResult> results, String userId) {
        this.results = results;
        this.userId = userId;
    }

    public List<TestResult> getResults() {
        return results;
    }

    public void setResults(List<TestResult> results) {
        this.results = results;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
} 