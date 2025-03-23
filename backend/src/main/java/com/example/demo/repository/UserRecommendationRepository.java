package com.example.demo.repository;

import com.example.demo.model.UserRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRecommendationRepository extends JpaRepository<UserRecommendation, Long> {
    Optional<UserRecommendation> findFirstByUserIdOrderByTimestampDesc(UUID userId);
} 