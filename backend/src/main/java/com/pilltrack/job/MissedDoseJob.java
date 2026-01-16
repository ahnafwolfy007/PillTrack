package com.pilltrack.job;

import com.pilltrack.model.entity.DoseLog;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.DoseStatus;
import com.pilltrack.repository.DoseLogRepository;
import com.pilltrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class MissedDoseJob implements Job {
    
    private final DoseLogRepository doseLogRepository;
    private final UserRepository userRepository;
    
    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        log.info("Running missed dose check job...");
        
        // Find all pending doses that are more than 6 hours past scheduled time
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(6);
        
        int markedCount = 0;
        
        // Process pending doses for each user
        List<User> users = userRepository.findAll();
        
        for (User user : users) {
            List<DoseLog> pendingDoses = doseLogRepository
                    .findPendingDosesBeforeTime(user.getId(), cutoffTime);
            
            for (DoseLog doseLog : pendingDoses) {
                if (doseLog.getStatus() == DoseStatus.PENDING) {
                    doseLog.setStatus(DoseStatus.MISSED);
                    doseLogRepository.save(doseLog);
                    markedCount++;
                    log.info("Marked dose as missed: {} for medication: {}", 
                            doseLog.getId(), doseLog.getMedication().getName());
                }
            }
        }
        
        log.info("Missed dose check job completed. Marked {} doses as missed.", markedCount);
    }
}
