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
import org.springframework.transaction.annotation.Transactional;

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
    @Transactional
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
            
            // Parse schedule info to get dose time
            LocalTime doseTime;
            try {
                doseTime = LocalTime.parse(reminder.getScheduleInfo());
            } catch (Exception e) {
                log.warn("Could not parse schedule info: {} for reminder: {}", 
                        reminder.getScheduleInfo(), reminder.getId());
                continue;
            }
            
            // Calculate reminder time (5 minutes before dose time)
            int minutesBefore = reminder.getMinutesBefore() != null ? reminder.getMinutesBefore() : 5;
            LocalTime reminderTriggerTime = doseTime.minusMinutes(minutesBefore);
            
            // Check if current time is within the reminder window (reminder trigger time to dose time)
            // We trigger if current time is within ±2.5 minutes of the reminder trigger time
            // This ensures the 5-minute Quartz interval catches the reminder
            if (currentTime.isBefore(reminderTriggerTime.minusMinutes(3)) || 
                currentTime.isAfter(reminderTriggerTime.plusMinutes(3))) {
                continue;
            }
            
            // Create dose log for this time (at the actual dose time, not reminder time)
            LocalDateTime scheduledTime = LocalDateTime.of(today, doseTime);
            
            // Check if dose log already exists for this medication and time to prevent duplicates
            boolean doseLogExists = doseLogRepository.existsByMedicationIdAndScheduledTime(
                    medication.getId(), scheduledTime);
            
            if (doseLogExists) {
                log.debug("Dose log already exists for medication: {} at {}", medication.getName(), scheduledTime);
                continue;
            }
            
            DoseLog doseLog = DoseLog.builder()
                    .medication(medication)
                    .scheduledTime(scheduledTime)
                    .status(DoseStatus.PENDING)
                    .build();
            doseLogRepository.save(doseLog);
            
            log.info("Created dose log for medication: {} at {}", medication.getName(), scheduledTime);
            
            // Send reminder notification (use doseTime to tell user when to take medication)
            try {
                notificationService.sendMedicationReminder(
                        medication.getUser(),
                        medication.getName(),
                        medication.getDosage(),
                        doseTime
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
