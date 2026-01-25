package com.pilltrack.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.annotation.PreDestroy;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Thread-safe connection tracker for monitoring concurrent device connections.
 * This helps track how many devices are accessing the API simultaneously.
 */
@Slf4j
@Component
public class ConnectionTracker {

    // Thread-safe counter for active connections
    private final AtomicInteger activeConnections = new AtomicInteger(0);
    
    // Thread-safe map to track connections by device/IP
    private final Map<String, AtomicInteger> connectionsByDevice = new ConcurrentHashMap<>();
    
    // Peak connections tracking
    private final AtomicInteger peakConnections = new AtomicInteger(0);

    /**
     * Register a new connection (call at request start).
     * Thread-safe for concurrent access.
     */
    public void registerConnection(String deviceId) {
        int current = activeConnections.incrementAndGet();
        
        // Update peak if needed
        peakConnections.updateAndGet(peak -> Math.max(peak, current));
        
        // Track by device
        connectionsByDevice
                .computeIfAbsent(deviceId, k -> new AtomicInteger(0))
                .incrementAndGet();
        
        if (current % 10 == 0) {
            log.debug("Active connections: {} (peak: {})", current, peakConnections.get());
        }
    }

    /**
     * Unregister a connection (call at request end).
     * Thread-safe for concurrent access.
     */
    public void unregisterConnection(String deviceId) {
        activeConnections.decrementAndGet();
        
        AtomicInteger deviceConnections = connectionsByDevice.get(deviceId);
        if (deviceConnections != null) {
            deviceConnections.decrementAndGet();
        }
    }

    /**
     * Get current active connection count.
     */
    public int getActiveConnections() {
        return activeConnections.get();
    }

    /**
     * Get peak connection count.
     */
    public int getPeakConnections() {
        return peakConnections.get();
    }

    /**
     * Get connections by device.
     */
    public Map<String, Integer> getConnectionsByDevice() {
        Map<String, Integer> result = new ConcurrentHashMap<>();
        connectionsByDevice.forEach((device, count) -> result.put(device, count.get()));
        return result;
    }

    /**
     * Get number of unique devices currently connected.
     */
    public int getUniqueDeviceCount() {
        return (int) connectionsByDevice.values().stream()
                .filter(count -> count.get() > 0)
                .count();
    }

    @PreDestroy
    public void shutdown() {
        log.info("Connection Tracker shutdown. Peak connections during session: {}", peakConnections.get());
    }
}
