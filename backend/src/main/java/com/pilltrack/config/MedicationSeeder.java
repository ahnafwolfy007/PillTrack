package com.pilltrack.config;

import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.Reminder;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.model.enums.MedicationType;
import com.pilltrack.model.enums.ReminderType;
import com.pilltrack.repository.MedicationRepository;
import com.pilltrack.repository.ReminderRepository;
import com.pilltrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(3) // Run after DoctorPatientSeeder
public class MedicationSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MedicationRepository medicationRepository;
    private final ReminderRepository reminderRepository;

    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    // Common medications data: {name, type, dosage, frequency, instructions}
    private static final String[][] MEDICATION_DATA = {
            {"Metformin", "TABLET", "500mg", "2", "Take with meals to reduce stomach upset"},
            {"Lisinopril", "TABLET", "10mg", "1", "Take at the same time each day"},
            {"Amlodipine", "TABLET", "5mg", "1", "May take with or without food"},
            {"Atorvastatin", "TABLET", "20mg", "1", "Take in the evening for best effect"},
            {"Omeprazole", "CAPSULE", "20mg", "1", "Take 30 minutes before breakfast"},
            {"Metoprolol", "TABLET", "50mg", "2", "Do not stop suddenly without doctor advice"},
            {"Losartan", "TABLET", "50mg", "1", "Stay hydrated while taking this medication"},
            {"Gabapentin", "CAPSULE", "300mg", "3", "Take with or without food"},
            {"Sertraline", "TABLET", "50mg", "1", "Take in the morning with food"},
            {"Levothyroxine", "TABLET", "75mcg", "1", "Take on empty stomach, 30 min before breakfast"},
            {"Hydrochlorothiazide", "TABLET", "25mg", "1", "Take in the morning to avoid nighttime urination"},
            {"Pantoprazole", "TABLET", "40mg", "1", "Take before meals"},
            {"Escitalopram", "TABLET", "10mg", "1", "May cause drowsiness, take at bedtime"},
            {"Prednisone", "TABLET", "10mg", "1", "Take with food to reduce stomach irritation"},
            {"Montelukast", "TABLET", "10mg", "1", "Take once daily in the evening"},
            {"Fluticasone", "INHALER", "50mcg", "2", "Rinse mouth after use"},
            {"Albuterol", "INHALER", "90mcg", "4", "Use as needed for breathing difficulty"},
            {"Cetirizine", "TABLET", "10mg", "1", "May cause drowsiness"},
            {"Vitamin D3", "CAPSULE", "1000IU", "1", "Take with fatty food for better absorption"},
            {"Aspirin", "TABLET", "81mg", "1", "Take with food to reduce stomach upset"},
            {"Clopidogrel", "TABLET", "75mg", "1", "Do not stop without consulting doctor"},
            {"Warfarin", "TABLET", "5mg", "1", "Regular blood tests required"},
            {"Insulin Glargine", "INJECTION", "10units", "1", "Inject at the same time each day"},
            {"Methotrexate", "TABLET", "2.5mg", "1", "Take only once weekly"},
            {"Ibuprofen", "TABLET", "400mg", "3", "Take with food or milk"},
            {"Acetaminophen", "TABLET", "500mg", "4", "Do not exceed 4000mg per day"},
            {"Amoxicillin", "CAPSULE", "500mg", "3", "Complete full course of antibiotics"},
            {"Azithromycin", "TABLET", "250mg", "1", "Take 1 hour before or 2 hours after meals"},
            {"Ciprofloxacin", "TABLET", "500mg", "2", "Avoid dairy products while taking"},
            {"Doxycycline", "CAPSULE", "100mg", "2", "Take with full glass of water, avoid lying down"}
    };

    // Time slots for medications
    private static final LocalTime[][] TIME_SLOTS = {
            {LocalTime.of(8, 0)}, // Once daily morning
            {LocalTime.of(8, 0), LocalTime.of(20, 0)}, // Twice daily
            {LocalTime.of(8, 0), LocalTime.of(14, 0), LocalTime.of(20, 0)}, // Three times daily
            {LocalTime.of(6, 0), LocalTime.of(12, 0), LocalTime.of(18, 0), LocalTime.of(22, 0)} // Four times daily
    };

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            log.info("Medication seeding is disabled (app.seed-demo-data=false)");
            return;
        }

        log.info("Starting medication seeding for patients...");

        try {
            seedMedicationsForPatients();
            log.info("Successfully seeded medications for patients");
        } catch (Exception e) {
            log.error("Error seeding medications: {}", e.getMessage(), e);
        }
    }

    private void seedMedicationsForPatients() {
        Random random = new Random();

        // Get all patients (users with patient emails)
        for (int i = 1; i <= 15; i++) {
            String patientEmail = "patient" + i + "@pilltrack.com";
            User patient = userRepository.findByEmail(patientEmail).orElse(null);

            if (patient == null) {
                log.warn("Patient {} not found, skipping...", patientEmail);
                continue;
            }

            // Check if patient already has medications
            List<Medication> existingMeds = medicationRepository.findByUserId(patient.getId());
            if (!existingMeds.isEmpty()) {
                log.info("Patient {} already has {} medications, skipping...", patientEmail, existingMeds.size());
                continue;
            }

            // Assign 3-5 random medications to each patient
            int numMedications = 3 + random.nextInt(3); // 3 to 5 medications
            List<Integer> usedIndices = new ArrayList<>();

            for (int j = 0; j < numMedications; j++) {
                // Pick a random medication that hasn't been used for this patient
                int medIndex;
                do {
                    medIndex = random.nextInt(MEDICATION_DATA.length);
                } while (usedIndices.contains(medIndex));
                usedIndices.add(medIndex);

                String[] medData = MEDICATION_DATA[medIndex];
                String name = medData[0];
                MedicationType type = MedicationType.valueOf(medData[1]);
                String dosage = medData[2];
                int frequency = Integer.parseInt(medData[3]);
                String instructions = medData[4];

                // Create medication
                Medication medication = Medication.builder()
                        .user(patient)
                        .name(name)
                        .type(type)
                        .dosage(dosage)
                        .frequency(frequency)
                        .inventory(30 + random.nextInt(60)) // 30 to 90 pills
                        .quantityPerDose(1)
                        .reminderMinutesBefore(5)
                        .startDate(LocalDate.now().minusDays(random.nextInt(30))) // Started 0-30 days ago
                        .instructions(instructions)
                        .prescribedBy("Dr. " + getRandomDoctorName(random))
                        .status(MedicationStatus.ACTIVE)
                        .build();

                medication = medicationRepository.save(medication);

                // Create reminders based on frequency
                LocalTime[] times = TIME_SLOTS[Math.min(frequency - 1, TIME_SLOTS.length - 1)];
                // Convert times to comma-separated string for scheduleInfo
                String scheduleInfo = java.util.Arrays.stream(times)
                        .limit(Math.min(frequency, times.length))
                        .map(LocalTime::toString)
                        .collect(Collectors.joining(","));
                
                Reminder reminder = Reminder.builder()
                        .medication(medication)
                        .reminderType(ReminderType.FIXED_TIME)
                        .scheduleInfo(scheduleInfo)
                        .isActive(true)
                        .minutesBefore(5)
                        .build();
                reminderRepository.save(reminder);

                log.info("Created medication {} for patient {}", name, patient.getName());
            }
        }
    }

    private String getRandomDoctorName(Random random) {
        String[] doctorNames = {
                "Sarah Ahmed", "Mohammad Khan", "Fatima Rahman", "Ali Hassan",
                "Nadia Islam", "Karim Uddin", "Ayesha Begum", "Tariq Mahmud"
        };
        return doctorNames[random.nextInt(doctorNames.length)];
    }
}
