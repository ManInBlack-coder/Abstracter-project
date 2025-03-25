package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "test_session_results")
public class TestSessionResult {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "session_timestamp", nullable = false)
    private LocalDateTime sessionTimestamp;

    @Column(name = "sequence_percentage")
    private Double sequencePercentage;

    @Column(name = "pattern_percentage")
    private Double patternPercentage;

    @Column(name = "analogy_percentage")
    private Double analogyPercentage;

    @Column(name = "categorization_percentage")
    private Double categorizationPercentage;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public LocalDateTime getSessionTimestamp() {
        return sessionTimestamp;
    }

    public void setSessionTimestamp(LocalDateTime sessionTimestamp) {
        this.sessionTimestamp = sessionTimestamp;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Double getSequencePercentage() {
        return sequencePercentage;
    }

    public void setSequencePercentage(Double sequencePercentage) {
        this.sequencePercentage = sequencePercentage;
    }

    public Double getPatternPercentage() {
        return patternPercentage;
    }

    public void setPatternPercentage(Double patternPercentage) {
        this.patternPercentage = patternPercentage;
    }

    public Double getAnalogyPercentage() {
        return analogyPercentage;
    }

    public void setAnalogyPercentage(Double analogyPercentage) {
        this.analogyPercentage = analogyPercentage;
    }

    public Double getCategorizationPercentage() {
        return categorizationPercentage;
    }

    public void setCategorizationPercentage(Double categorizationPercentage) {
        this.categorizationPercentage = categorizationPercentage;
    }
} 