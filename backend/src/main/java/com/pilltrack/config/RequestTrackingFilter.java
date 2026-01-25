package com.pilltrack.config;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Filter to track incoming requests for connection monitoring.
 * Runs early in the filter chain to capture all requests.
 */
@Slf4j
@Component
@Order(1)
@RequiredArgsConstructor
public class RequestTrackingFilter implements Filter {

    private final ConnectionTracker connectionTracker;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String deviceId = extractDeviceId(httpRequest);
        
        try {
            // Register connection start
            connectionTracker.registerConnection(deviceId);
            
            // Continue with request
            chain.doFilter(request, response);
            
        } finally {
            // Always unregister, even on exceptions
            connectionTracker.unregisterConnection(deviceId);
        }
    }

    /**
     * Extract a device identifier from the request.
     * Uses IP + User-Agent as a simple device fingerprint.
     */
    private String extractDeviceId(HttpServletRequest request) {
        String ip = getClientIp(request);
        String userAgent = request.getHeader("User-Agent");
        
        // Simple device categorization
        String deviceType = "unknown";
        if (userAgent != null) {
            userAgent = userAgent.toLowerCase();
            if (userAgent.contains("mobile") || userAgent.contains("android") || userAgent.contains("iphone")) {
                deviceType = "mobile";
            } else if (userAgent.contains("windows") || userAgent.contains("macintosh") || userAgent.contains("linux")) {
                deviceType = "desktop";
            }
        }
        
        return ip + "_" + deviceType;
    }

    /**
     * Get the real client IP, considering proxy headers.
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // If there are multiple IPs (from proxy chain), take the first
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
