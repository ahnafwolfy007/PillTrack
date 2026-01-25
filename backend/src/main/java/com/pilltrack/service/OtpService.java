package com.pilltrack.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Slf4j
@Service
public class OtpService {
    
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    
    @Value("${app.otp.expiry-minutes:10}")
    private int otpExpiryMinutes;
    
    @Value("${app.otp.length:6}")
    private int otpLength;
    
    /**
     * Generates a random numeric OTP of specified length
     */
    public String generateOtp() {
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }
        String generatedOtp = otp.toString();
        log.debug("Generated OTP: {}", generatedOtp);
        return generatedOtp;
    }
    
    /**
     * Calculates OTP expiry time from now
     */
    public LocalDateTime calculateExpiryTime() {
        return LocalDateTime.now().plusMinutes(otpExpiryMinutes);
    }
    
    /**
     * Validates if the OTP matches and is not expired
     */
    public boolean validateOtp(String storedOtp, String providedOtp, LocalDateTime expiryTime) {
        if (storedOtp == null || providedOtp == null || expiryTime == null) {
            log.warn("OTP validation failed: null values provided");
            return false;
        }
        
        if (LocalDateTime.now().isAfter(expiryTime)) {
            log.warn("OTP validation failed: OTP has expired");
            return false;
        }
        
        boolean isValid = storedOtp.equals(providedOtp);
        if (!isValid) {
            log.warn("OTP validation failed: OTP mismatch");
        }
        return isValid;
    }
    
    /**
     * Checks if the OTP has expired
     */
    public boolean isOtpExpired(LocalDateTime expiryTime) {
        if (expiryTime == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(expiryTime);
    }
    
    /**
     * Gets the OTP expiry duration in minutes
     */
    public int getOtpExpiryMinutes() {
        return otpExpiryMinutes;
    }
}
