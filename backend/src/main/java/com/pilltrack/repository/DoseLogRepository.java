package com.pilltrack.repository;

import com.pilltrack.model.entity.DoseLog;
import com.pilltrack.model.enums.DoseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoseLogRepository extends JpaRepository<DoseLog, Long> {
    
    List<DoseLog> findByMedicationId(Long medicationId);
    
    Page<DoseLog> findByMedicationId(Long medicationId, Pageable pageable);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.user.id = :userId")
    List<DoseLog> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.user.id = :userId")
    Page<DoseLog> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.user.id = :userId AND " +
           "d.scheduledTime BETWEEN :startDate AND :endDate ORDER BY d.scheduledTime")
    List<DoseLog> findByUserIdAndDateRange(@Param("userId") Long userId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.id = :medicationId AND " +
           "d.scheduledTime BETWEEN :startDate AND :endDate ORDER BY d.scheduledTime")
    List<DoseLog> findByMedicationIdAndDateRange(@Param("medicationId") Long medicationId,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.user.id = :userId AND d.status = :status")
    List<DoseLog> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") DoseStatus status);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.user.id = :userId AND " +
           "d.scheduledTime <= :time AND d.status = 'PENDING' ORDER BY d.scheduledTime")
    List<DoseLog> findPendingDosesBeforeTime(@Param("userId") Long userId, @Param("time") LocalDateTime time);
    
    @Query("SELECT COUNT(d) FROM DoseLog d WHERE d.medication.user.id = :userId AND d.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") DoseStatus status);
    
    @Query("SELECT COUNT(d) FROM DoseLog d WHERE d.medication.user.id = :userId AND " +
           "d.scheduledTime BETWEEN :startDate AND :endDate AND d.status = :status")
    long countByUserIdAndDateRangeAndStatus(@Param("userId") Long userId,
                                             @Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate,
                                             @Param("status") DoseStatus status);
    
    @Query("SELECT d FROM DoseLog d WHERE d.medication.user.id = :userId AND " +
           "CAST(d.scheduledTime AS date) = CURRENT_DATE ORDER BY d.scheduledTime")
    List<DoseLog> findTodaysDosesByUserId(@Param("userId") Long userId);
    
    // Check if dose log already exists for a medication at a specific scheduled time
    boolean existsByMedicationIdAndScheduledTime(Long medicationId, LocalDateTime scheduledTime);
}
