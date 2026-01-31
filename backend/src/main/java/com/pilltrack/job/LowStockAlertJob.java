package com.pilltrack.job;

import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.repository.MedicationRepository;
import com.pilltrack.repository.UserRepository;
import com.pilltrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class LowStockAlertJob implements Job {
    
    private final MedicationRepository medicationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    @Override
    @Transactional
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Running low stock alert job...");
        
        int processedCount = 0;
        
        // Get all users and check their medications for low stock
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            List<Medication> lowStockMeds = medicationRepository.findLowStockByUserId(user.getId());
            
            for (Medication medication : lowStockMeds) {
                // Default threshold is 5 days of inventory
                int daysRemaining = medication.getDaysRemaining();
                
                if (daysRemaining <= 5) {
                    try {
                        notificationService.sendLowStockAlert(
                                medication.getUser(),
                                medication.getName(),
                                medication.getInventory()
                        );
                        processedCount++;
                        log.info("Sent low stock alert for medication: {} to user: {}", 
                                medication.getName(), medication.getUser().getEmail());
                    } catch (Exception e) {
                        log.error("Failed to send low stock alert for medication: {}", medication.getName(), e);
                    }
                }
            }
        }
        
        log.info("Low stock alert job completed. Sent {} alerts.", processedCount);
    }
}
