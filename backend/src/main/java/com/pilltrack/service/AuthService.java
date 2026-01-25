package com.pilltrack.service;

import com.pilltrack.dto.request.LoginRequest;
import com.pilltrack.dto.request.RegisterRequest;
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

import java.util.Collections;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());
        
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
        
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .isActive(true)
                .isEmailVerified(false)
                .build();
        
        user = userRepository.save(user);
        
        log.info("User registered successfully with ID: {} and role: {}", user.getId(), roleType);
        
        // Generate tokens
        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user);
        
        return buildAuthResponse(user, accessToken, refreshToken);
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
