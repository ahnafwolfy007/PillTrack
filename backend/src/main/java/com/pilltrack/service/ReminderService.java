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
    public void createRemindersForMedication(Medication medication, List<String> reminderTimes) {
        for (String timeStr : reminderTimes) {
            try {
                LocalTime time = LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
                
                // Create cron expression: seconds minutes hours * * ?
                String cronExpression = String.format("0 %d %d * * ?", time.getMinute(), time.getHour());
                
                Reminder reminder = Reminder.builder()
                        .medication(medication)
                        .reminderType(ReminderType.FIXED_TIME)
                        .scheduleInfo(timeStr)
                        .cronExpression(cronExpression)
                        .jobKey("reminder_" + medication.getId() + "_" + UUID.randomUUID().toString().substring(0, 8))
                        .isActive(true)
                        .build();
                
                reminderRepository.save(reminder);
                log.info("Reminder created for medication {} at {}", medication.getName(), time);
                
            } catch (Exception e) {
                log.error("Failed to create reminder for time: {}", timeStr, e);
            }
        }
    }
    
    @Transactional
    public void updateRemindersForMedication(Medication medication, List<String> reminderTimes) {
        // Deactivate existing reminders
        deactivateRemindersForMedication(medication.getId());
        
        // Create new reminders
        createRemindersForMedication(medication, reminderTimes);
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
