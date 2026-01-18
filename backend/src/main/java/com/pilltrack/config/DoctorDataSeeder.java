package com.pilltrack.config;

import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.Specialty;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.SpecialtyRepository;
import com.pilltrack.service.DoctorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class DoctorDataSeeder implements CommandLineRunner {
    
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    private final DoctorService doctorService;
    
    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;
    
    // Specialty icon mapping
    private static final Map<String, String> SPECIALTY_ICONS = new LinkedHashMap<>();
    
    static {
        SPECIALTY_ICONS.put("Heart", "Heart");
        SPECIALTY_ICONS.put("Brain", "Brain");
        SPECIALTY_ICONS.put("Bone", "Bone");
        SPECIALTY_ICONS.put("Eye", "Eye");
        SPECIALTY_ICONS.put("Skin", "Sparkles");
        SPECIALTY_ICONS.put("Child", "Baby");
        SPECIALTY_ICONS.put("Women", "UserCircle");
        SPECIALTY_ICONS.put("Lung", "Wind");
        SPECIALTY_ICONS.put("Stomach", "Cookie");
        SPECIALTY_ICONS.put("Kidney", "Droplets");
        SPECIALTY_ICONS.put("Cancer", "AlertTriangle");
        SPECIALTY_ICONS.put("Blood", "Droplet");
        SPECIALTY_ICONS.put("Mental", "Brain");
        SPECIALTY_ICONS.put("Diabetes", "Activity");
        SPECIALTY_ICONS.put("Surgery", "Scissors");
        SPECIALTY_ICONS.put("Dental", "Smile");
        SPECIALTY_ICONS.put("ENT", "Ear");
        SPECIALTY_ICONS.put("Nutrition", "Apple");
        SPECIALTY_ICONS.put("Physical", "Dumbbell");
        SPECIALTY_ICONS.put("Emergency", "Siren");
        SPECIALTY_ICONS.put("Elderly", "Users");
        SPECIALTY_ICONS.put("Infection", "Bug");
        SPECIALTY_ICONS.put("General", "Stethoscope");
        SPECIALTY_ICONS.put("default", "Stethoscope");
    }
    
    @Override
    public void run(String... args) throws Exception {
        if (!seedDemoData) {
            log.info("Doctor data seeding is disabled (app.seed-demo-data=false)");
            return;
        }
        
        if (doctorRepository.count() > 0) {
            log.info("Doctors data already exists ({} doctors), skipping seeding", doctorRepository.count());
            return;
        }
        
        log.info("Starting doctor data seeding with sample data...");
        seedSampleDoctors();
    }
    
    private void seedSampleDoctors() {
        // Sample specialties to create
        String[][] sampleSpecialties = {
            {"Cardiologist", "Heart & Cardiovascular Care"},
            {"Neurologist", "Brain & Nervous System"},
            {"Orthopedic Surgeon", "Bones & Joints"},
            {"Ophthalmologist", "Eye Care"},
            {"Dermatologist", "Skin Care"},
            {"Pediatrician", "Child Health"},
            {"Gynecologist & Obstetrician", "Women's Health"},
            {"Pulmonologist", "Lung & Respiratory"},
            {"Gastroenterologist", "Digestive System"},
            {"Nephrologist", "Kidney Care"},
            {"Oncologist", "Cancer Treatment"},
            {"Hematologist", "Blood Disorders"},
            {"Psychiatrist", "Mental Health"},
            {"Endocrinologist", "Diabetes & Hormones"},
            {"General Surgeon", "General Surgery"},
            {"Dentist", "Dental Care"},
            {"ENT Specialist", "Ear, Nose & Throat"},
            {"Nutritionist", "Diet & Nutrition"},
            {"Physical Medicine Specialist", "Physical Therapy & Rehab"},
            {"Rheumatologist", "Arthritis & Autoimmune"},
            {"Urologist", "Urinary System"},
            {"Medicine Specialist", "Internal Medicine"},
            {"Family Medicine", "Primary Care"},
            {"Diabetologist", "Diabetes Care"},
            {"Hepatologist", "Liver Care"},
            {"Thoracic Surgeon", "Chest Surgery"},
            {"Plastic Surgeon", "Plastic & Reconstructive"},
            {"Vascular Surgeon", "Blood Vessel Surgery"},
            {"Neurosurgeon", "Brain & Spine Surgery"},
            {"Laparoscopic Surgeon", "Minimally Invasive Surgery"}
        };
        
        String[] firstNames = {"Md.", "Mohammad", "Abdul", "Shamsul", "Nazmul", "Rezaul", 
            "Fatema", "Ayesha", "Tahmina", "Nasreen", "Sharmin", "Farzana", "Prof. Dr.",
            "Assoc. Prof. Dr.", "Asst. Prof. Dr.", "Dr."};
        
        String[] lastNames = {"Rahman", "Islam", "Hossain", "Khan", "Ahmed", "Alam", "Uddin",
            "Karim", "Haque", "Chowdhury", "Miah", "Begum", "Khatun", "Akter", "Das", "Roy"};
        
        String[] locations = {"Dhaka", "Chittagong", "Sylhet", "Rajshahi", "Khulna",
            "Barisal", "Rangpur", "Mymensingh", "Comilla", "Gazipur", "Narayanganj"};
        
        String[] chambers = {"Popular Diagnostic Centre", "Square Hospital", "United Hospital",
            "Labaid Hospital", "Ibn Sina Hospital", "Evercare Hospital", "Apollo Hospital",
            "Green Life Hospital", "National Heart Foundation", "BIRDEM Hospital"};
        
        Map<String, Specialty> specialtyMap = new HashMap<>();
        Random random = new Random(42); // Fixed seed for reproducibility
        
        // Create specialties first
        for (String[] spec : sampleSpecialties) {
            String name = spec[0];
            String description = spec[1];
            
            String displayName = doctorService.getDisplayName(name);
            String slug = name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
            String iconName = findIconForSpecialty(name);
            
            Specialty specialty = Specialty.builder()
                    .name(name)
                    .displayName(displayName)
                    .description(description)
                    .slug(slug)
                    .iconName(iconName)
                    .isActive(true)
                    .build();
            
            specialty = specialtyRepository.save(specialty);
            specialtyMap.put(name, specialty);
        }
        
        log.info("Created {} specialties", specialtyMap.size());
        
        // Create 5 doctors per specialty = 150 doctors
        List<Doctor> doctors = new ArrayList<>();
        
        for (String[] spec : sampleSpecialties) {
            String specialtyName = spec[0];
            Specialty specialty = specialtyMap.get(specialtyName);
            
            for (int i = 0; i < 5; i++) {
                String firstName = firstNames[random.nextInt(firstNames.length)];
                String lastName = lastNames[random.nextInt(lastNames.length)];
                String name = firstName + " " + lastName;
                if (i > 0) {
                    name += " " + (char)('A' + i);
                }
                
                String education = "MBBS, FCPS (" + specialtyName.split(" ")[0] + ")";
                String location = locations[random.nextInt(locations.length)];
                String chamber = chambers[random.nextInt(chambers.length)] + " | " + location;
                int experience = 5 + random.nextInt(25);
                double fee = 500 + random.nextInt(26) * 100;
                double rating = 3.5 + random.nextDouble() * 1.5;
                rating = Math.round(rating * 10) / 10.0;
                int ratingCount = 10 + random.nextInt(491);
                
                Doctor doctor = Doctor.builder()
                        .name(name)
                        .education(education)
                        .specialty(specialty)
                        .specialtyRaw(specialtyName)
                        .experienceYears(experience)
                        .chamber(chamber)
                        .location(location)
                        .concentrations(spec[1])
                        .consultationFee(fee)
                        .rating(rating)
                        .ratingCount(ratingCount)
                        .isAvailable(true)
                        .isActive(true)
                        .build();
                
                doctors.add(doctor);
            }
        }
        
        // Save all doctors
        doctorRepository.saveAll(doctors);
        log.info("Doctor seeding complete! Total: {} doctors, {} specialties", 
                doctors.size(), specialtyMap.size());
    }
    
    private String findIconForSpecialty(String specialtyName) {
        String lowerName = specialtyName.toLowerCase();
        
        for (Map.Entry<String, String> entry : SPECIALTY_ICONS.entrySet()) {
            if (lowerName.contains(entry.getKey().toLowerCase())) {
                return entry.getValue();
            }
        }
        
        return SPECIALTY_ICONS.get("default");
    }
}
