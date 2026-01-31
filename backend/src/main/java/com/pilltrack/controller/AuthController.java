package com.pilltrack.controller;

import com.pilltrack.dto.request.*;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.AuthResponse;
import com.pilltrack.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management endpoints")
public class AuthController {
    
    private final AuthService authService;
    
    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Registers a new user and sends OTP for email verification")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "User registered successfully. Please verify your email with the OTP sent."));
    }

    @PostMapping("/register/doctor")
    @Operation(summary = "Register a new doctor", description = "Registers a new doctor and sends OTP for email verification")
    public ResponseEntity<ApiResponse<AuthResponse>> registerDoctor(@Valid @RequestBody RegisterRequest request) {
        request.setRole("DOCTOR");
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Doctor registered successfully. Please verify your email with the OTP sent."));
    }
    
    @PostMapping("/verify-email")
    @Operation(summary = "Verify email with OTP", description = "Verifies user email using the OTP sent during registration")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyEmail(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully"));
    }
    
    @PostMapping("/resend-verification-otp")
    @Operation(summary = "Resend verification OTP", description = "Resends the email verification OTP")
    public ResponseEntity<ApiResponse<Void>> resendVerificationOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.resendVerificationOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Verification OTP sent successfully"));
    }
    
    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset", description = "Sends an OTP to reset password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset OTP sent to your email"));
    }
    
    @PostMapping("/verify-reset-otp")
    @Operation(summary = "Verify password reset OTP", description = "Verifies the OTP for password reset")
    public ResponseEntity<ApiResponse<Void>> verifyResetOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyPasswordResetOtp(request);
        return ResponseEntity.ok(ApiResponse.success(null, "OTP verified successfully"));
    }
    
    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with OTP", description = "Resets the password using the verified OTP")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successfully"));
    }
    
    @PostMapping("/resend-reset-otp")
    @Operation(summary = "Resend password reset OTP", description = "Resends the password reset OTP")
    public ResponseEntity<ApiResponse<Void>> resendResetOtp(@Valid @RequestBody SendOtpRequest request) {
        authService.resendPasswordResetOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset OTP sent successfully"));
    }
    
    @PostMapping("/pre-register/send-otp")
    @Operation(summary = "Send pre-registration OTP", description = "Sends OTP to verify email before registration")
    public ResponseEntity<ApiResponse<Void>> sendPreRegistrationOtp(@Valid @RequestBody PreRegistrationOtpRequest request) {
        authService.sendPreRegistrationOtp(request.getEmail(), request.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Verification OTP sent to your email"));
    }
    
    @PostMapping("/pre-register/verify-otp")
    @Operation(summary = "Verify pre-registration OTP", description = "Verifies email OTP and returns verification token for registration")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> verifyPreRegistrationOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String token = authService.verifyPreRegistrationOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success(
            java.util.Map.of("verificationToken", token), 
            "Email verified successfully. You can now complete registration."
        ));
    }
    
    @PostMapping("/pre-register/resend-otp")
    @Operation(summary = "Resend pre-registration OTP", description = "Resends OTP for pre-registration verification")
    public ResponseEntity<ApiResponse<Void>> resendPreRegistrationOtp(@Valid @RequestBody PreRegistrationOtpRequest request) {
        authService.resendPreRegistrationOtp(request.getEmail(), request.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Verification OTP resent to your email"));
    }
    
    @PostMapping("/change-password")
    @Operation(summary = "Change password", description = "Changes the password for authenticated user")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(userDetails.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password changed successfully"));
    }
    
    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String refreshToken) {
        AuthResponse response = authService.refreshToken(refreshToken);
        return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
    }
}
