package com.pilltrack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.lang.reflect.Method;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Async and threading configuration for handling multiple concurrent requests.
 * This enables the application to handle requests from multiple devices simultaneously
 * (e.g., PC and phone on the same network).
 */
@Slf4j
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig implements AsyncConfigurer {

    /**
     * Main async executor for handling concurrent operations.
     * This thread pool handles:
     * - Multiple simultaneous API requests
     * - Background notification processing
     * - Async database operations
     */
    @Bean(name = "taskExecutor")
    public ThreadPoolTaskExecutor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Core pool size - always running threads
        executor.setCorePoolSize(10);
        
        // Maximum threads when under load
        executor.setMaxPoolSize(50);
        
        // Queue for pending tasks when all threads are busy
        executor.setQueueCapacity(100);
        
        // Thread naming for debugging
        executor.setThreadNamePrefix("PillTrack-Async-");
        
        // Keep extra threads alive for 60 seconds
        executor.setKeepAliveSeconds(60);
        
        // Allow core threads to timeout (reduces resources when idle)
        executor.setAllowCoreThreadTimeOut(true);
        
        // Rejection policy: Run in caller thread if queue is full
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // Wait for tasks to complete on shutdown
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        
        log.info("Async Task Executor initialized with core={}, max={}, queue={}",
                executor.getCorePoolSize(), executor.getMaxPoolSize(), 100);
        
        return executor;
    }

    /**
     * Separate executor for notification processing to prevent blocking main requests.
     */
    @Bean(name = "notificationExecutor")
    public ThreadPoolTaskExecutor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("PillTrack-Notification-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        
        log.info("Notification Executor initialized");
        return executor;
    }

    /**
     * Executor for scheduled tasks (reminders, cleanup jobs).
     */
    @Bean(name = "scheduledExecutor")
    public ThreadPoolTaskExecutor scheduledExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("PillTrack-Scheduled-");
        executor.initialize();
        
        log.info("Scheduled Executor initialized");
        return executor;
    }

    @Override
    public Executor getAsyncExecutor() {
        return taskExecutor();
    }

    @Override
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new CustomAsyncExceptionHandler();
    }

    /**
     * Custom exception handler for async operations.
     */
    private static class CustomAsyncExceptionHandler implements AsyncUncaughtExceptionHandler {
        @Override
        public void handleUncaughtException(Throwable ex, Method method, Object... params) {
            log.error("Async exception in method {} with params {}: {}",
                    method.getName(), params, ex.getMessage(), ex);
        }
    }
}
