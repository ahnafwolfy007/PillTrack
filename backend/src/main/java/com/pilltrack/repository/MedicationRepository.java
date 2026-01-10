package com.pilltrack.repository;

import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.enums.MedicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    
    List<Medication> findByUserId(Long userId);
    
    Page<Medication> findByUserId(Long userId, Pageable pageable);
    
    List<Medication> findByUserIdAndStatus(Long userId, MedicationStatus status);
    
    @Query("SELECT m FROM Medication m WHERE m.user.id = :userId AND m.status = 'ACTIVE'")
    List<Medication> findActiveByUserId(@Param("userId") Long userId);
    
    @Query("SELECT m FROM Medication m WHERE m.user.id = :userId AND " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Medication> searchByUserIdAndName(@Param("userId") Long userId, 
                                           @Param("query") String query, 
                                           Pageable pageable);
    
    @Query("SELECT m FROM Medication m WHERE m.user.id = :userId AND m.inventory <= 5")
    List<Medication> findLowStockByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(m) FROM Medication m WHERE m.user.id = :userId AND m.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") MedicationStatus status);
    
    @Query("SELECT COUNT(m) FROM Medication m WHERE m.user.id = :userId AND m.inventory <= 5")
    long countLowStockByUserId(@Param("userId") Long userId);
}
