package com.pilltrack.service;

import com.pilltrack.dto.request.ChangePasswordRequest;
import com.pilltrack.dto.request.UpdateUserRequest;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.dto.response.UserResponse;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.RoleType;
import com.pilltrack.repository.UserRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUser currentUser;
    
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        return mapToResponse(user);
    }
    
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToResponse(user);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        return buildPageResponse(usersPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsersByRole(RoleType roleType, Pageable pageable) {
        Page<User> usersPage = userRepository.findByRoleName(roleType, pageable);
        return buildPageResponse(usersPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> searchUsers(String query, Pageable pageable) {
        Page<User> usersPage = userRepository.searchUsers(query, pageable);
        return buildPageResponse(usersPage);
    }
    
    public long getTotalUserCount() {
        return userRepository.count();
    }
    
    @Transactional
    public UserResponse updateProfile(UpdateUserRequest request) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        // Combine firstName and lastName into name
        if (request.getFirstName() != null || request.getLastName() != null) {
            String firstName = request.getFirstName() != null ? request.getFirstName() : "";
            String lastName = request.getLastName() != null ? request.getLastName() : "";
            String fullName = (firstName + " " + lastName).trim();
            if (!fullName.isEmpty()) {
                user.setName(fullName);
            }
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getCity() != null) {
            user.setCity(request.getCity());
        }
        if (request.getPostalCode() != null) {
            user.setPostalCode(request.getPostalCode());
        }
        if (request.getAvatarUrl() != null) {
            user.setProfileImageUrl(request.getAvatarUrl());
        }
        
        user = userRepository.save(user);
        log.info("Profile updated for user: {}", user.getEmail());
        
        return mapToResponse(user);
    }
    
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }
        
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        log.info("Password changed for user: {}", user.getEmail());
    }
    
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setIsActive(false);
        userRepository.save(user);
        
        log.info("User deactivated: {}", user.getEmail());
    }
    
    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setIsActive(true);
        userRepository.save(user);
        
        log.info("User activated: {}", user.getEmail());
    }
    
    private UserResponse mapToResponse(User user) {
        // Single role
        List<String> roles = Collections.singletonList(user.getRole().getName().name());
        
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .dateOfBirth(null) // User entity doesn't have dateOfBirth
                .gender(null) // User entity doesn't have gender
                .address(user.getAddress())
                .city(user.getCity())
                .country(null) // User entity doesn't have country
                .postalCode(user.getPostalCode())
                .avatarUrl(user.getProfileImageUrl())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    private PageResponse<UserResponse> buildPageResponse(Page<User> usersPage) {
        List<UserResponse> users = usersPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<UserResponse>builder()
                .content(users)
                .pageNumber(usersPage.getNumber())
                .pageSize(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .first(usersPage.isFirst())
                .last(usersPage.isLast())
                .hasNext(usersPage.hasNext())
                .hasPrevious(usersPage.hasPrevious())
                .build();
    }
}
