package com.pilltrack.config;

import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.DoctorPatient;
import com.pilltrack.model.entity.Role;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.RoleType;
import com.pilltrack.repository.DoctorPatientRepository;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.RoleRepository;
import com.pilltrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(2) // Run after DataInitializer
public class DoctorPatientSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorPatientRepository doctorPatientRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    private static final String DEFAULT_PASSWORD = "password123";

    // Doctor names and specialties
    private static final String[][] DOCTOR_DATA = {
            {"Dr. Sarah Ahmed", "Cardiologist", "MBBS, MD (Cardiology)", "10"},
            {"Dr. Mohammad Khan", "Neurologist", "MBBS, MD (Neurology)", "15"},
            {"Dr. Fatima Rahman", "Pediatrician", "MBBS, DCH", "8"},
            {"Dr. Ali Hassan", "Orthopedic Surgeon", "MBBS, MS (Ortho)", "12"},
            {"Dr. Nadia Islam", "Dermatologist", "MBBS, DD", "7"},
            {"Dr. Karim Uddin", "Gastroenterologist", "MBBS, MD (Gastro)", "20"},
            {"Dr. Ayesha Begum", "Gynecologist", "MBBS, FCPS (Gynae)", "14"},
            {"Dr. Tariq Mahmud", "Pulmonologist", "MBBS, MD (Pulmonology)", "11"},
            {"Dr. Sultana Akhter", "Endocrinologist", "MBBS, MD (Endocrinology)", "9"},
            {"Dr. Imran Hossain", "Psychiatrist", "MBBS, MD (Psychiatry)", "13"},
            {"Dr. Rashida Khatun", "Ophthalmologist", "MBBS, DO", "16"},
            {"Dr. Zahid Hasan", "ENT Specialist", "MBBS, MS (ENT)", "10"},
            {"Dr. Lubna Yasmin", "Nephrologist", "MBBS, MD (Nephrology)", "8"},
            {"Dr. Anwar Hossain", "General Surgeon", "MBBS, FCPS (Surgery)", "18"},
            {"Dr. Nasreen Akter", "Rheumatologist", "MBBS, MD (Rheumatology)", "6"}
    };

    // Patient names
    private static final String[] PATIENT_NAMES = {
            "Rahim Uddin", "Karim Miah", "Jamal Ahmed", "Shakil Hossain", "Mamun Rahman",
            "Nasir Uddin", "Kabir Khan", "Faisal Alam", "Rashed Chowdhury", "Tanvir Hasan",
            "Shamim Ahmed", "Rafiq Islam", "Monir Hossain", "Delwar Hossain", "Shafiq Rahman"
    };

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            log.info("Demo data seeding is disabled. Set app.seed-demo-data=true to enable.");
            return;
        }

        log.info("Starting Doctor and Patient data seeding...");

        try {
            List<Doctor> doctors = seedDoctors();
            List<User> patients = seedPatients();
            assignPatientsToDoctor(doctors, patients);

            log.info("Successfully seeded {} doctors and {} patients with relationships", doctors.size(), patients.size());
        } catch (Exception e) {
            log.error("Error seeding doctor/patient data: {}", e.getMessage(), e);
        }
    }

    private List<Doctor> seedDoctors() {
        List<Doctor> doctors = new ArrayList<>();
        Role doctorRole = roleRepository.findByName(RoleType.DOCTOR)
                .orElseThrow(() -> new RuntimeException("DOCTOR role not found"));

        for (int i = 0; i < DOCTOR_DATA.length; i++) {
            String[] data = DOCTOR_DATA[i];
            String name = data[0];
            String specialty = data[1];
            String education = data[2];
            int experience = Integer.parseInt(data[3]);

            String email = "doctor" + (i + 1) + "@pilltrack.com";

            // Check if doctor user already exists
            if (userRepository.existsByEmail(email)) {
                log.info("Doctor user {} already exists, skipping...", email);
                Doctor existingDoctor = doctorRepository.findByUserId(
                        userRepository.findByEmail(email).get().getId()
                ).orElse(null);
                if (existingDoctor != null) {
                    doctors.add(existingDoctor);
                }
                continue;
            }

            // Create doctor user
            User doctorUser = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .role(doctorRole)
                    .isActive(true)
                    .isEmailVerified(true)
                    .phone("+880" + (1700000000 + new Random().nextInt(99999999)))
                    .build();
            doctorUser = userRepository.save(doctorUser);

            // Create doctor entity
            Doctor doctor = Doctor.builder()
                    .user(doctorUser)
                    .name(name)
                    .specialtyRaw(specialty)
                    .education(education)
                    .experienceYears(experience)
                    .email(email)
                    .phone(doctorUser.getPhone())
                    .location("Dhaka, Bangladesh")
                    .chamber("PillTrack Medical Center")
                    .consultationFee(500.0 + (i * 100))
                    .rating(4.0 + (new Random().nextDouble() * 1.0))
                    .ratingCount(50 + new Random().nextInt(200))
                    .isAvailable(true)
                    .isActive(true)
                    .build();
            doctor = doctorRepository.save(doctor);
            doctors.add(doctor);

            log.info("Created doctor: {} ({})", name, specialty);
        }

        return doctors;
    }

    private List<User> seedPatients() {
        List<User> patients = new ArrayList<>();
        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new RuntimeException("USER role not found"));

        for (int i = 0; i < PATIENT_NAMES.length; i++) {
            String name = PATIENT_NAMES[i];
            String email = "patient" + (i + 1) + "@pilltrack.com";

            // Check if patient user already exists
            if (userRepository.existsByEmail(email)) {
                log.info("Patient user {} already exists, skipping...", email);
                User existingPatient = userRepository.findByEmail(email).orElse(null);
                if (existingPatient != null) {
                    patients.add(existingPatient);
                }
                continue;
            }

            // Create patient user
            User patient = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                    .role(userRole)
                    .isActive(true)
                    .isEmailVerified(true)
                    .phone("+880" + (1800000000 + new Random().nextInt(99999999)))
                    .build();
            patient = userRepository.save(patient);
            patients.add(patient);

            log.info("Created patient: {}", name);
        }

        return patients;
    }

    private void assignPatientsToDoctor(List<Doctor> doctors, List<User> patients) {
        if (doctors.isEmpty() || patients.isEmpty()) {
            log.warn("No doctors or patients to assign");
            return;
        }

        // Assign 5 patients to each doctor (patients can have multiple doctors)
        int patientsPerDoctor = 5;
        int patientIndex = 0;

        for (Doctor doctor : doctors) {
            for (int j = 0; j < patientsPerDoctor; j++) {
                User patient = patients.get(patientIndex % patients.size());

                // Check if relationship already exists
                if (doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), patient.getId())) {
                    log.info("Relationship between doctor {} and patient {} already exists, skipping...",
                            doctor.getName(), patient.getName());
                    patientIndex++;
                    continue;
                }

                DoctorPatient relationship = DoctorPatient.builder()
                        .doctor(doctor)
                        .patient(patient)
                        .status("ACTIVE")
                        .canModifyMedication(false) // Initially doctors cannot modify medications
                        .notes("Assigned via seeder")
                        .build();
                doctorPatientRepository.save(relationship);

                log.info("Assigned patient {} to doctor {}", patient.getName(), doctor.getName());
                patientIndex++;
            }
        }
    }
}
