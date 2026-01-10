package com.pilltrack.job;

import com.pilltrack.model.entity.DoseLog;
import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.Reminder;
import com.pilltrack.model.enums.DoseStatus;
import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.model.enums.ReminderType;
import com.pilltrack.repository.DoseLogRepository;
import com.pilltrack.repository.MedicationRepository;
import com.pilltrack.repository.ReminderRepository;
import com.pilltrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MedicationReminderJob implements Job {
    
    private final MedicationRepository medicationRepository;
    private final ReminderRepository reminderRepository;
    private final DoseLogRepository doseLogRepository;
    private final NotificationService notificationService;
    
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Running medication reminder job...");
        
        LocalTime currentTime = LocalTime.now();
        LocalDate today = LocalDate.now();
        
        // Get active fixed-time reminders
        List<Reminder> reminders = reminderRepository.findByReminderTypeAndIsActiveTrue(ReminderType.FIXED_TIME);
        
        int processedCount = 0;
        
        for (Reminder reminder : reminders) {
            Medication medication = reminder.getMedication();
            
            // Skip if medication is not active
            if (medication.getStatus() != MedicationStatus.ACTIVE) {
                continue;
            }
            
            // Check if medication is within date range
            if (medication.getStartDate() != null && today.isBefore(medication.getStartDate())) {
                continue;
            }
            if (medication.getEndDate() != null && today.isAfter(medication.getEndDate())) {
                continue;
            }
            
            // Parse schedule info to get reminder time
            LocalTime reminderTime;
            try {
                reminderTime = LocalTime.parse(reminder.getScheduleInfo());
            } catch (Exception e) {
                log.warn("Could not parse schedule info: {} for reminder: {}", 
                        reminder.getScheduleInfo(), reminder.getId());
                continue;
            }
            
            // Check if current time is within +/- 5 minutes of reminder time
            if (reminderTime.isBefore(currentTime.minusMinutes(5)) || 
                reminderTime.isAfter(currentTime.plusMinutes(5))) {
                continue;
            }
            
            // Create dose log for this time
            LocalDateTime scheduledTime = LocalDateTime.of(today, reminderTime);
            
            DoseLog doseLog = DoseLog.builder()
                    .medication(medication)
                    .scheduledTime(scheduledTime)
                    .status(DoseStatus.PENDING)
                    .build();
            doseLogRepository.save(doseLog);
            
            log.info("Created dose log for medication: {} at {}", medication.getName(), scheduledTime);
            
            // Send reminder notification
            try {
                notificationService.sendMedicationReminder(
                        medication.getUser(),
                        medication.getName(),
                        medication.getDosage(),
                        reminderTime
                );
                processedCount++;
                log.info("Sent reminder for medication: {} to user: {}", 
                        medication.getName(), medication.getUser().getEmail());
            } catch (Exception e) {
                log.error("Failed to send reminder for medication: {}", medication.getName(), e);
            }
        }
        
        log.info("Medication reminder job completed. Processed {} reminders.", processedCount);
    }
}
