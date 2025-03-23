package com.example.demo.repository;

import com.example.demo.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, Long> {
    List<TestResult> findByUserId(UUID userId);
    List<TestResult> findByUserIdAndTimestampAfter(UUID userId, LocalDateTime timestamp);
} 