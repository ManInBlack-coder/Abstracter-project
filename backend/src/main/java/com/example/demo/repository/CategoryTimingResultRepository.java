package com.example.demo.repository;

import com.example.demo.model.CategoryTimingResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;
import java.util.List;

@Repository
public interface CategoryTimingResultRepository extends JpaRepository<CategoryTimingResult, UUID> {
    List<CategoryTimingResult> findBySessionId(UUID sessionId);
} 