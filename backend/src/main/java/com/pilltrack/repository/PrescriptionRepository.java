package com.pilltrack.repository;

import com.pilltrack.model.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    
    List<Prescription> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<Prescription> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    // Find active prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.user.id = :userId AND p.isActive = true AND (p.expiryDate IS NULL OR p.expiryDate >= :today)")
    List<Prescription> findActiveByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    // Find verified prescriptions
    List<Prescription> findByUserIdAndIsVerifiedTrue(Long userId);
    
    // Find unverified prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.isVerified = false ORDER BY p.createdAt")
    List<Prescription> findUnverified();
    
    // Find expired prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.user.id = :userId AND p.expiryDate < :today AND p.isActive = true")
    List<Prescription> findExpiredByUserId(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    // Count prescriptions
    long countByUserId(Long userId);
    
    long countByUserIdAndIsVerifiedTrue(Long userId);
    
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.isVerified = false")
    long countUnverified();
    
    // Find by order ID - prescriptions linked to an order
    @Query("SELECT p FROM Prescription p JOIN p.orders o WHERE o.id = :orderId")
    List<Prescription> findByOrderId(@Param("orderId") Long orderId);
    
    // Find unverified/pending prescriptions with pagination
    Page<Prescription> findByIsVerifiedFalseAndIsActiveTrue(Pageable pageable);
}
