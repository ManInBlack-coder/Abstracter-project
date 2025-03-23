package com.example.demo.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "category_timing_results")
public class CategoryTimingResult {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "session_id", nullable = false)
    private UUID sessionId;

    @Column(nullable = false)
    private String category;

    @Column(name = "average_time_seconds", nullable = false)
    private Double averageTimeSeconds;

    @Column(name = "question_count", nullable = false)
    private Integer questionCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", insertable = false, updatable = false)
    private TestSessionResult testSession;

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getAverageTimeSeconds() {
        return averageTimeSeconds;
    }

    public void setAverageTimeSeconds(Double averageTimeSeconds) {
        this.averageTimeSeconds = averageTimeSeconds;
    }

    public Integer getQuestionCount() {
        return questionCount;
    }

    public void setQuestionCount(Integer questionCount) {
        this.questionCount = questionCount;
    }

    public TestSessionResult getTestSession() {
        return testSession;
    }

    public void setTestSession(TestSessionResult testSession) {
        this.testSession = testSession;
    }
} 