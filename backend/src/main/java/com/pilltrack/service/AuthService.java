package com.pilltrack.service;

import com.pilltrack.dto.request.*;
import com.pilltrack.dto.response.AuthResponse;
import com.pilltrack.dto.response.UserResponse;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceAlreadyExistsException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Role;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.RoleType;
import com.pilltrack.repository.RoleRepository;
import com.pilltrack.repository.UserRepository;
import com.pilltrack.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final OtpService otpService;
    private final EmailService emailService;
    
    // Temporary storage for pre-registration OTPs (email -> OtpData)
    private final Map<String, PreRegistrationOtpData> preRegistrationOtps = new ConcurrentHashMap<>();
    // Verified email tokens (token -> email)
    private final Map<String, VerifiedEmailData> verifiedEmailTokens = new ConcurrentHashMap<>();
    
    private record PreRegistrationOtpData(String otp, LocalDateTime expiry, String name) {}
    private record VerifiedEmailData(String email, LocalDateTime expiry) {}
    
    @Transactional
    public void sendPreRegistrationOtp(String email, String name) {
        log.info("Sending pre-registration OTP to: {}", email);
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException("User", "email", email);
        }
        
        // Generate OTP
        String otp = otpService.generateOtp();
        LocalDateTime expiry = otpService.calculateExpiryTime();
        
        // Store OTP temporarily
        preRegistrationOtps.put(email.toLowerCase(), new PreRegistrationOtpData(otp, expiry, name));
        
        // Send OTP email
        emailService.sendRegistrationOtpEmail(email, name, otp, otpService.getOtpExpiryMinutes());
        
        log.info("Pre-registration OTP sent to: {}", email);
    }
    
    @Transactional
    public String verifyPreRegistrationOtp(String email, String otp) {
        log.info("Verifying pre-registration OTP for: {}", email);
        
        PreRegistrationOtpData otpData = preRegistrationOtps.get(email.toLowerCase());
        
        if (otpData == null) {
            throw new BadRequestException("No OTP found for this email. Please request a new OTP.");
        }
        
        if (!otpService.validateOtp(otpData.otp(), otp, otpData.expiry())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        
        // Remove the used OTP
        preRegistrationOtps.remove(email.toLowerCase());
        
        // Generate a verification token
        String verificationToken = UUID.randomUUID().toString();
        verifiedEmailTokens.put(verificationToken, new VerifiedEmailData(email.toLowerCase(), LocalDateTime.now().plusMinutes(30)));
        
        log.info("Pre-registration OTP verified for: {}", email);
        
        return verificationToken;
    }
    
    @Transactional
    public void resendPreRegistrationOtp(String email, String name) {
        log.info("Resending pre-registration OTP to: {}", email);
        
        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException("User", "email", email);
        }
        
        // Generate new OTP
        String otp = otpService.generateOtp();
        LocalDateTime expiry = otpService.calculateExpiryTime();
        
        // Store OTP temporarily
        preRegistrationOtps.put(email.toLowerCase(), new PreRegistrationOtpData(otp, expiry, name));
        
        // Send OTP email
        emailService.sendRegistrationOtpEmail(email, name, otp, otpService.getOtpExpiryMinutes());
        
        log.info("Pre-registration OTP resent to: {}", email);
    }
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        
        // Check for verification token (required for email-verified registration)
        boolean isEmailVerified = false;
        if (request.getEmailVerificationToken() != null && !request.getEmailVerificationToken().isBlank()) {
            VerifiedEmailData verifiedData = verifiedEmailTokens.get(request.getEmailVerificationToken());
            if (verifiedData != null && verifiedData.email().equalsIgnoreCase(request.getEmail()) 
                    && verifiedData.expiry().isAfter(LocalDateTime.now())) {
                isEmailVerified = true;
                verifiedEmailTokens.remove(request.getEmailVerificationToken());
                log.info("Email pre-verified for registration: {}", request.getEmail());
            } else {
                throw new BadRequestException("Invalid or expired email verification token. Please verify your email again.");
            }
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("User", "email", request.getEmail());
        }
        
        if (request.getPhone() != null && !request.getPhone().isBlank() && userRepository.existsByPhone(request.getPhone())) {
            throw new ResourceAlreadyExistsException("User", "phone", request.getPhone());
        }
        
        // Determine role from request, default to USER
        RoleType requestedRole = RoleType.USER;
        if (request.getRole() != null && !request.getRole().isBlank()) {
            try {
                requestedRole = RoleType.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role '{}', defaulting to USER", request.getRole());
            }
        }
        final RoleType roleType = requestedRole;
        
        Role role = roleRepository.findByName(roleType)
            .orElseGet(() -> roleRepository.save(Role.builder().name(roleType).build()));
        
        User user;
        if (isEmailVerified) {
            // Email already verified through pre-registration OTP
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .phone(request.getPhone())
                    .role(role)
                    .isActive(true)
                    .isEmailVerified(true)
                    .build();
            
            user = userRepository.save(user);
            log.info("User registered with pre-verified email. ID: {} role: {}", user.getId(), roleType);
        } else {
            // Legacy flow: generate OTP for email verification
            String otp = otpService.generateOtp();
            LocalDateTime otpExpiry = otpService.calculateExpiryTime();
            
            user = User.builder()
                    .name(request.getName())
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .phone(request.getPhone())
                    .role(role)
                    .isActive(true)
                    .isEmailVerified(false)
                    .emailVerificationOtp(otp)
                    .emailVerificationOtpExpiry(otpExpiry)
                    .build();
            
            user = userRepository.save(user);
            
            // Send verification OTP email
            emailService.sendRegistrationOtpEmail(user.getEmail(), user.getName(), otp, otpService.getOtpExpiryMinutes());
            log.info("User registered with pending email verification. ID: {} role: {}", user.getId(), roleType);
        }
        
        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        return buildAuthResponse(user, accessToken, refreshToken);
    }
    
    @Transactional
    public void verifyEmail(VerifyOtpRequest request) {
        log.info("Verifying email for: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        
        if (user.getIsEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        if (!otpService.validateOtp(user.getEmailVerificationOtp(), request.getOtp(), user.getEmailVerificationOtpExpiry())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        
        user.setIsEmailVerified(true);
        user.setEmailVerificationOtp(null);
        user.setEmailVerificationOtpExpiry(null);
        userRepository.save(user);
        
        // Send confirmation email
        emailService.sendEmailVerifiedEmail(user.getEmail(), user.getName());
        
        log.info("Email verified successfully for user: {}", user.getEmail());
    }
    
    @Transactional
    public void resendVerificationOtp(String email) {
        log.info("Resending verification OTP for: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        if (user.getIsEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }
        
        // Generate new OTP
        String otp = otpService.generateOtp();
        LocalDateTime otpExpiry = otpService.calculateExpiryTime();
        
        user.setEmailVerificationOtp(otp);
        user.setEmailVerificationOtpExpiry(otpExpiry);
        userRepository.save(user);
        
        // Send OTP email
        emailService.sendRegistrationOtpEmail(user.getEmail(), user.getName(), otp, otpService.getOtpExpiryMinutes());
        
        log.info("Verification OTP resent to: {}", email);
    }
    
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        log.info("Password reset requested for: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        
        // Generate OTP for password reset
        String otp = otpService.generateOtp();
        LocalDateTime otpExpiry = otpService.calculateExpiryTime();
        
        user.setPasswordResetOtp(otp);
        user.setPasswordResetOtpExpiry(otpExpiry);
        userRepository.save(user);
        
        // Send password reset OTP email
        emailService.sendPasswordResetOtpEmail(user.getEmail(), user.getName(), otp, otpService.getOtpExpiryMinutes());
        
        log.info("Password reset OTP sent to: {}", request.getEmail());
    }
    
    @Transactional
    public void verifyPasswordResetOtp(VerifyOtpRequest request) {
        log.info("Verifying password reset OTP for: {}", request.getEmail());
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        
        if (!otpService.validateOtp(user.getPasswordResetOtp(), request.getOtp(), user.getPasswordResetOtpExpiry())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        
        log.info("Password reset OTP verified for: {}", request.getEmail());
    }
    
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Resetting password for: {}", request.getEmail());
        
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
        
        if (!otpService.validateOtp(user.getPasswordResetOtp(), request.getOtp(), user.getPasswordResetOtpExpiry())) {
            throw new BadRequestException("Invalid or expired OTP");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetOtp(null);
        user.setPasswordResetOtpExpiry(null);
        userRepository.save(user);
        
        // Send password changed confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getName());
        
        log.info("Password reset successfully for: {}", request.getEmail());
    }
    
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        log.info("Changing password for: {}", email);
        
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New passwords do not match");
        }
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        // Check if new password is same as current
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from current password");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Send password changed confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getName());
        
        log.info("Password changed successfully for: {}", email);
    }
    
    @Transactional
    public void resendPasswordResetOtp(String email) {
        log.info("Resending password reset OTP for: {}", email);
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        // Generate new OTP
        String otp = otpService.generateOtp();
        LocalDateTime otpExpiry = otpService.calculateExpiryTime();
        
        user.setPasswordResetOtp(otp);
        user.setPasswordResetOtpExpiry(otpExpiry);
        userRepository.save(user);
        
        // Send OTP email
        emailService.sendPasswordResetOtpEmail(user.getEmail(), user.getName(), otp, otpService.getOtpExpiryMinutes());
        
        log.info("Password reset OTP resent to: {}", email);
    }
    
    @Transactional
    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = (User) authentication.getPrincipal();
        
        userRepository.save(user);
        
        String accessToken = jwtTokenProvider.generateAccessToken(authentication);
        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
        
        log.info("User logged in successfully: {}", user.getEmail());
        
        return buildAuthResponse(user, accessToken, refreshToken);
    }
    
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid refresh token");
        }
        
        String email = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        
        String newAccessToken = jwtTokenProvider.generateAccessToken(user);
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }
    
    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        String roleName = user.getRole().getName().name();
        List<String> roles = Collections.singletonList(roleName);
        
        UserResponse userResponse = UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .city(user.getCity())
                .postalCode(user.getPostalCode())
                .avatarUrl(user.getProfileImageUrl())
                .dateOfBirth(user.getDateOfBirth())
                .bloodType(user.getBloodType())
                .allergies(user.getAllergies())
                .emergencyContact(user.getEmergencyContact())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
        
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getJwtExpiration())
                .user(userResponse)
                .roles(roles)
                .build();
    }
}
