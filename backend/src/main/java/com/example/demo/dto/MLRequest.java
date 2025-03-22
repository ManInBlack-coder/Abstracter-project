package com.example.demo.dto;

import com.example.demo.model.TestResult;
import java.util.List;

public class MLRequest {
    private List<TestResult> results;

    public MLRequest(List<TestResult> results) {
        this.results = results;
    }

    public List<TestResult> getResults() {
        return results;
    }

    public void setResults(List<TestResult> results) {
        this.results = results;
    }
} 