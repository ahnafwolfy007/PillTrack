package com.pilltrack.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow frontend origins - including LAN access with any IP
        // Using patterns to allow any IP on port 5173
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:3000",
                "http://192.168.*.*:5173",  // Common home network range
                "http://10.*.*.*:5173",      // Private network range
                "http://172.16.*.*:5173",    // Private network range
                "http://172.17.*.*:5173",
                "http://172.18.*.*:5173",
                "http://172.19.*.*:5173",
                "http://172.20.*.*:5173",
                "http://172.21.*.*:5173",
                "http://172.22.*.*:5173",
                "http://172.23.*.*:5173",
                "http://172.24.*.*:5173",
                "http://172.25.*.*:5173",
                "http://172.26.*.*:5173",
                "http://172.27.*.*:5173",
                "http://172.28.*.*:5173",
                "http://172.29.*.*:5173",
                "http://172.30.*.*:5173",
                "http://172.31.*.*:5173"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Allow all headers
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",
                "Content-Type",
                "X-Requested-With",
                "Accept",
                "Origin",
                "Access-Control-Request-Method",
                "Access-Control-Request-Headers"
        ));
        
        // Expose these headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
                "Access-Control-Allow-Origin",
                "Access-Control-Allow-Credentials",
                "Authorization"
        ));
        
        // Allow credentials
        configuration.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
