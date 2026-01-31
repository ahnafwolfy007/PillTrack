package com.pilltrack.config;

import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.Role;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.RoleType;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.RoleRepository;
import com.pilltrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        try {
            initializeRoles();
            initializeAdminUser();
            initializeMainDoctor();
            markExistingUsersAsVerified();
            resetTestUserPassword();
        } catch (Exception e) {
            log.warn("Data initialization skipped (database may be read-only): {}", e.getMessage());
        }
    }
    
    private void resetTestUserPassword() {
        // Reset password for test user aatique223597@bscse.uiu.ac.bd
        userRepository.findByEmail("aatique223597@bscse.uiu.ac.bd").ifPresent(user -> {
            user.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user);
            log.info("Reset password for test user: aatique223597@bscse.uiu.ac.bd to password123");
        });
    }

    private void initializeRoles() {
        for (RoleType roleType : RoleType.values()) {
            if (!roleRepository.existsByName(roleType)) {
                Role role = new Role();
                role.setName(roleType);
                roleRepository.save(role);
                log.info("Created role: {}", roleType);
            }
        }
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByEmail("admin@pilltrack.com")) {
            Role adminRole = roleRepository.findByName(RoleType.ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            User admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@pilltrack.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);
            admin.setIsActive(true);
            admin.setIsEmailVerified(true);

            userRepository.save(admin);
            log.info("Created admin user: admin@pilltrack.com");
        }
    }

    private void initializeMainDoctor() {
        if (!userRepository.existsByEmail("doctormain@gmail.com")) {
            Role doctorRole = roleRepository.findByName(RoleType.DOCTOR)
                    .orElseThrow(() -> new RuntimeException("Doctor role not found"));

            // Create User account for doctor
            User doctorUser = new User();
            doctorUser.setName("Dr. John Smith");
            doctorUser.setEmail("doctormain@gmail.com");
            doctorUser.setPassword(passwordEncoder.encode("password1234"));
            doctorUser.setRole(doctorRole);
            doctorUser.setIsActive(true);
            doctorUser.setIsEmailVerified(true);
            doctorUser = userRepository.save(doctorUser);

            // Create Doctor profile
            Doctor doctor = Doctor.builder()
                    .user(doctorUser)
                    .name("Dr. John Smith")
                    .education("MBBS, MD (Internal Medicine), FCPS")
                    .specialtyRaw("Internal Medicine")
                    .experienceYears(15)
                    .chamber("PillTrack Medical Center, Floor 3, Room 301")
                    .location("Dhaka")
                    .concentrations("General Medicine, Diabetes Management, Hypertension, Preventive Care")
                    .phone("+880-1700-000001")
                    .email("doctormain@gmail.com")
                    .consultationFee(1500.0)
                    .rating(4.8)
                    .ratingCount(120)
                    .isAvailable(true)
                    .isActive(true)
                    .build();

            doctorRepository.save(doctor);
            log.info("Created main doctor: doctormain@gmail.com / password1234");
        }
    }
    
    private void markExistingUsersAsVerified() {
        // Mark all existing users as email verified (migration for existing users)
        int updatedCount = userRepository.markAllUnverifiedUsersAsVerified();
        if (updatedCount > 0) {
            log.info("Marked {} existing users as email verified", updatedCount);
        }
    }
}
