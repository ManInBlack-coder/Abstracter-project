package com.example.demo.dto;

import com.example.demo.model.TestResult;
import java.util.List;

public class TestSubmissionRequest {
    private String userId;
    private List<TestResult> results;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<TestResult> getResults() {
        return results;
    }

    public void setResults(List<TestResult> results) {
        this.results = results;
    }
} 