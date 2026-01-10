package com.pilltrack.repository;

import com.pilltrack.model.entity.Reminder;
import com.pilltrack.model.enums.ReminderType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    
    List<Reminder> findByMedicationId(Long medicationId);
    
    List<Reminder> findByMedicationIdAndIsActiveTrue(Long medicationId);
    
    @Query("SELECT r FROM Reminder r WHERE r.medication.user.id = :userId AND r.isActive = true")
    List<Reminder> findActiveByUserId(@Param("userId") Long userId);
    
    @Query("SELECT r FROM Reminder r WHERE r.medication.user.id = :userId")
    List<Reminder> findByUserId(@Param("userId") Long userId);
    
    List<Reminder> findByReminderTypeAndIsActiveTrue(ReminderType reminderType);
    
    Optional<Reminder> findByJobKey(String jobKey);
    
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.medication.user.id = :userId AND r.isActive = true")
    long countActiveByUserId(@Param("userId") Long userId);
    
    void deleteByMedicationId(Long medicationId);
}
