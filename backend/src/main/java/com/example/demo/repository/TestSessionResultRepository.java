package com.example.demo.repository;

import com.example.demo.model.TestSessionResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface TestSessionResultRepository extends JpaRepository<TestSessionResult, UUID> {
    List<TestSessionResult> findByUserIdOrderBySessionTimestampDesc(UUID userId);
} 