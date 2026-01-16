package com.pilltrack.service;

import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.Reminder;
import com.pilltrack.model.enums.ReminderType;
import com.pilltrack.repository.ReminderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderService {
    
    private final ReminderRepository reminderRepository;
    
    @Transactional
    public void createRemindersForMedication(Medication medication, List<String> reminderTimes, Integer minutesBefore) {
        int reminderMinutes = minutesBefore != null ? minutesBefore : 5; // Default to 5 minutes before
        
        for (String timeStr : reminderTimes) {
            try {
                LocalTime time = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
                
                // Adjust time for early reminder if specified
                LocalTime reminderTime = time.minusMinutes(reminderMinutes);
                
                // Create cron expression: seconds minutes hours * * ?
                String cronExpression = String.format("0 %d %d * * ?", reminderTime.getMinute(), reminderTime.getHour());
                
                Reminder reminder = Reminder.builder()
                        .medication(medication)
                        .reminderType(ReminderType.FIXED_TIME)
                        .scheduleInfo(timeStr) // Keep original time for display
                        .cronExpression(cronExpression)
                        .jobKey("reminder_" + medication.getId() + "_" + UUID.randomUUID().toString().substring(0, 8))
                        .isActive(true)
                        .minutesBefore(reminderMinutes)
                        .build();
                
                reminderRepository.save(reminder);
                log.info("Reminder created for medication {} at {} ({} min before)", 
                        medication.getName(), time, reminderMinutes);
                
            } catch (Exception e) {
                log.error("Failed to create reminder for time: {}", timeStr, e);
            }
        }
    }
    
    @Transactional
    public void createRemindersForMedication(Medication medication, List<String> reminderTimes) {
        createRemindersForMedication(medication, reminderTimes, 5); // Default to 5 minutes before
    }
    
    @Transactional
    public void updateRemindersForMedication(Medication medication, List<String> reminderTimes, Integer minutesBefore) {
        // Deactivate existing reminders
        deactivateRemindersForMedication(medication.getId());
        
        // Create new reminders
        createRemindersForMedication(medication, reminderTimes, minutesBefore);
    }
    
    @Transactional
    public void updateRemindersForMedication(Medication medication, List<String> reminderTimes) {
        updateRemindersForMedication(medication, reminderTimes, 5); // Default to 5 minutes before
    }
    
    @Transactional
    public void deactivateRemindersForMedication(Long medicationId) {
        List<Reminder> reminders = reminderRepository.findByMedicationId(medicationId);
        for (Reminder reminder : reminders) {
            reminder.setIsActive(false);
            reminderRepository.save(reminder);
        }
        log.info("Deactivated {} reminders for medication {}", reminders.size(), medicationId);
    }
    
    @Transactional(readOnly = true)
    public List<Reminder> getActiveRemindersForUser(Long userId) {
        return reminderRepository.findActiveByUserId(userId);
    }
}
