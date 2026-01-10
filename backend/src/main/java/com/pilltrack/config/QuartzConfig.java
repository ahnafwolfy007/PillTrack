package com.pilltrack.config;

import com.pilltrack.job.LowStockAlertJob;
import com.pilltrack.job.MedicationReminderJob;
import com.pilltrack.job.MissedDoseJob;
import org.quartz.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class QuartzConfig {
    
    // Medication Reminder Job - Runs every 5 minutes
    @Bean
    public JobDetail medicationReminderJobDetail() {
        return JobBuilder.newJob(MedicationReminderJob.class)
                .withIdentity("medicationReminderJob")
                .withDescription("Sends medication reminders to users")
                .storeDurably()
                .build();
    }
    
    @Bean
    public Trigger medicationReminderTrigger(JobDetail medicationReminderJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(medicationReminderJobDetail)
                .withIdentity("medicationReminderTrigger")
                .withDescription("Trigger for medication reminder job")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 */5 * * * ?")) // Every 5 minutes
                .build();
    }
    
    // Low Stock Alert Job - Runs daily at 9 AM
    @Bean
    public JobDetail lowStockAlertJobDetail() {
        return JobBuilder.newJob(LowStockAlertJob.class)
                .withIdentity("lowStockAlertJob")
                .withDescription("Sends low stock alerts to users")
                .storeDurably()
                .build();
    }
    
    @Bean
    public Trigger lowStockAlertTrigger(JobDetail lowStockAlertJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(lowStockAlertJobDetail)
                .withIdentity("lowStockAlertTrigger")
                .withDescription("Trigger for low stock alert job")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 9 * * ?")) // Daily at 9 AM
                .build();
    }
    
    // Missed Dose Job - Runs every hour
    @Bean
    public JobDetail missedDoseJobDetail() {
        return JobBuilder.newJob(MissedDoseJob.class)
                .withIdentity("missedDoseJob")
                .withDescription("Marks missed doses")
                .storeDurably()
                .build();
    }
    
    @Bean
    public Trigger missedDoseTrigger(JobDetail missedDoseJobDetail) {
        return TriggerBuilder.newTrigger()
                .forJob(missedDoseJobDetail)
                .withIdentity("missedDoseTrigger")
                .withDescription("Trigger for missed dose job")
                .withSchedule(CronScheduleBuilder.cronSchedule("0 0 * * * ?")) // Every hour
                .build();
    }
}
