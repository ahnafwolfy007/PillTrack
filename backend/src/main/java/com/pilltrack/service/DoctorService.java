package com.pilltrack.service;

import com.pilltrack.dto.response.DoctorResponse;
import com.pilltrack.dto.response.SpecialtyResponse;
import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.Specialty;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.SpecialtyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DoctorService {
    
    private final DoctorRepository doctorRepository;
    private final SpecialtyRepository specialtyRepository;
    
    // Specialty normalization map: original name -> user-friendly display name
    private static final Map<String, String> SPECIALTY_DISPLAY_NAMES = new LinkedHashMap<>();
    
    static {
        // Heart & Cardiovascular
        SPECIALTY_DISPLAY_NAMES.put("Cardiologist", "Heart Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Cardiac Surgeon", "Heart Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Cardiothoracic Surgeon", "Heart & Chest Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Interventional Cardiologist", "Heart Intervention Specialist");
        
        // General & Internal Medicine
        SPECIALTY_DISPLAY_NAMES.put("Medicine Specialist", "General Medicine Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Internal Medicine", "Internal Medicine Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Internal Medicine Specialist", "Internal Medicine Doctor");
        SPECIALTY_DISPLAY_NAMES.put("General Physician", "General Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Family Medicine", "Family Doctor");
        
        // Women's Health
        SPECIALTY_DISPLAY_NAMES.put("Gynecologist & Obstetrician", "Women's Health Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Gynecologist", "Women's Health Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Gynecologists", "Women's Health Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Obstetrician", "Pregnancy & Childbirth Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Infertility Specialist", "Fertility Doctor");
        
        // Children's Health
        SPECIALTY_DISPLAY_NAMES.put("Pediatrician", "Child Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Pediatric Surgeon", "Children's Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Pediatric Cardiologist", "Children's Heart Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Neonatologist", "Newborn Specialist");
        
        // Brain & Nervous System
        SPECIALTY_DISPLAY_NAMES.put("Neurologist", "Brain & Nerve Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Neurosurgeon", "Brain & Spine Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Neuro Medicine", "Brain & Nerve Medicine");
        
        // Mental Health
        SPECIALTY_DISPLAY_NAMES.put("Psychiatrist", "Mental Health Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Psychologist", "Counselor / Therapist");
        SPECIALTY_DISPLAY_NAMES.put("Clinical Psychologist", "Clinical Therapist");
        
        // Bones & Muscles
        SPECIALTY_DISPLAY_NAMES.put("Orthopedic Surgeon", "Bone & Joint Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Orthopedist", "Bone & Joint Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Rheumatologist", "Arthritis & Joint Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Physiotherapist", "Physical Therapy Specialist");
        
        // Skin
        SPECIALTY_DISPLAY_NAMES.put("Dermatologist", "Skin Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Dermatology & Venereology", "Skin & STD Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Cosmetologist", "Cosmetic Skin Specialist");
        
        // Eyes
        SPECIALTY_DISPLAY_NAMES.put("Ophthalmologist", "Eye Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Optometrist", "Vision Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Oculoplastic Surgeon", "Eye Plastic Surgeon");
        
        // Ear, Nose, Throat
        SPECIALTY_DISPLAY_NAMES.put("ENT Specialist", "Ear, Nose & Throat Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Otolaryngologist", "Ear, Nose & Throat Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Otolaryngologists (ENT)", "Ear, Nose & Throat Doctor");
        SPECIALTY_DISPLAY_NAMES.put("ENT & Head Neck Surgeon", "ENT Surgeon");
        
        // Teeth & Mouth
        SPECIALTY_DISPLAY_NAMES.put("Dentist", "Dental Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Dental Surgeon", "Dental Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Orthodontist", "Teeth Alignment Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Maxillofacial Surgeon", "Jaw & Face Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Maxillofacial and Dental Surgeon", "Jaw & Dental Surgeon");
        
        // Digestive System
        SPECIALTY_DISPLAY_NAMES.put("Gastroenterologist", "Stomach & Digestive Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Hepatologist", "Liver Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Colorectal Surgeon", "Colon & Rectal Surgeon");
        
        // Kidney & Urinary
        SPECIALTY_DISPLAY_NAMES.put("Urologist", "Urinary & Kidney Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Nephrologist", "Kidney Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Andrologist", "Male Reproductive Specialist");
        
        // Lungs & Respiratory
        SPECIALTY_DISPLAY_NAMES.put("Respiratory Specialist", "Lung & Breathing Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Pulmonologist", "Lung Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Chest Specialist", "Chest & Lung Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Chest Medicine", "Chest & Lung Medicine");
        
        // Cancer
        SPECIALTY_DISPLAY_NAMES.put("Oncologist", "Cancer Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Surgical Oncologist", "Cancer Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Radiation Oncologist", "Radiation Therapy Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Medical Oncologist", "Cancer Treatment Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Hemato-Oncologist", "Blood Cancer Specialist");
        
        // Blood
        SPECIALTY_DISPLAY_NAMES.put("Hematologist", "Blood Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Transfusion Medicine", "Blood Transfusion Specialist");
        
        // Hormones
        SPECIALTY_DISPLAY_NAMES.put("Endocrinologist", "Hormone & Diabetes Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Diabetologist", "Diabetes Specialist");
        
        // Nutrition
        SPECIALTY_DISPLAY_NAMES.put("Nutritionist", "Diet & Nutrition Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Dietitian", "Diet Specialist");
        
        // Surgery
        SPECIALTY_DISPLAY_NAMES.put("General Surgeon", "General Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Plastic Surgeon", "Plastic & Cosmetic Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Vascular Surgeon", "Blood Vessel Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Laparoscopic Surgeon", "Minimally Invasive Surgeon");
        SPECIALTY_DISPLAY_NAMES.put("Thoracic Surgeon", "Chest Surgeon");
        
        // Pain & Anesthesia
        SPECIALTY_DISPLAY_NAMES.put("Anesthesiologist", "Anesthesia Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Pain Specialist", "Pain Management Specialist");
        
        // Radiology & Imaging
        SPECIALTY_DISPLAY_NAMES.put("Radiologist", "Medical Imaging Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Interventional Radiologist", "Imaging-Guided Treatment Specialist");
        
        // Emergency & Critical Care
        SPECIALTY_DISPLAY_NAMES.put("Intensivist", "ICU Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Emergency Medicine", "Emergency Care Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Critical Care", "Critical Care Specialist");
        
        // Alternative Medicine
        SPECIALTY_DISPLAY_NAMES.put("Homeopath", "Homeopathic Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Ayurvedic Practitioner", "Ayurvedic Doctor");
        SPECIALTY_DISPLAY_NAMES.put("Unani Practitioner", "Unani Doctor");
        
        // Other specialties
        SPECIALTY_DISPLAY_NAMES.put("Physical Medicine", "Rehabilitation Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Sports Medicine", "Sports Injury Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Geriatrician", "Elderly Care Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Allergist", "Allergy Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Immunologist", "Immune System Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Infectious Disease", "Infection Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Pathologist", "Lab & Diagnostic Specialist");
        SPECIALTY_DISPLAY_NAMES.put("Nuclear Medicine", "Nuclear Imaging Specialist");
    }
    
    public String getDisplayName(String originalSpecialty) {
        if (originalSpecialty == null || originalSpecialty.trim().isEmpty()) {
            return "General Practitioner";
        }
        
        // Direct match
        if (SPECIALTY_DISPLAY_NAMES.containsKey(originalSpecialty)) {
            return SPECIALTY_DISPLAY_NAMES.get(originalSpecialty);
        }
        
        // Try case-insensitive match
        for (Map.Entry<String, String> entry : SPECIALTY_DISPLAY_NAMES.entrySet()) {
            if (entry.getKey().equalsIgnoreCase(originalSpecialty)) {
                return entry.getValue();
            }
        }
        
        // Try partial match
        for (Map.Entry<String, String> entry : SPECIALTY_DISPLAY_NAMES.entrySet()) {
            if (originalSpecialty.toLowerCase().contains(entry.getKey().toLowerCase()) ||
                entry.getKey().toLowerCase().contains(originalSpecialty.toLowerCase())) {
                return entry.getValue();
            }
        }
        
        // Return original if no match found
        return originalSpecialty;
    }
    
    public List<SpecialtyResponse> getAllSpecialties() {
        return specialtyRepository.findByIsActiveTrueOrderByDisplayNameAsc()
                .stream()
                .map(this::mapToSpecialtyResponse)
                .collect(Collectors.toList());
    }
    
    public List<SpecialtyResponse> searchSpecialties(String query) {
        return specialtyRepository.searchByNameOrDisplayName(query)
                .stream()
                .map(this::mapToSpecialtyResponse)
                .collect(Collectors.toList());
    }
    
    public List<DoctorResponse> getAllDoctors() {
        return doctorRepository.findAllActiveWithSpecialty()
                .stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
    
    public DoctorResponse getDoctorById(Long id) {
        return doctorRepository.findByIdWithSpecialty(id)
                .map(this::mapToDoctorResponse)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + id));
    }
    
    public List<DoctorResponse> getDoctorsBySpecialty(Long specialtyId) {
        return doctorRepository.findBySpecialtyIdWithSpecialty(specialtyId)
                .stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
    
    public List<DoctorResponse> searchDoctors(String query) {
        // First search by display name in our normalization map
        List<String> matchingSpecialties = SPECIALTY_DISPLAY_NAMES.entrySet().stream()
                .filter(e -> e.getValue().toLowerCase().contains(query.toLowerCase()) ||
                             e.getKey().toLowerCase().contains(query.toLowerCase()))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        // Search in database
        List<Doctor> results = doctorRepository.searchDoctors(query);
        
        // Add doctors matching our specialty normalization
        if (!matchingSpecialties.isEmpty()) {
            for (String specialty : matchingSpecialties) {
                List<Doctor> specialtyDoctors = doctorRepository.searchDoctors(specialty);
                for (Doctor doc : specialtyDoctors) {
                    if (results.stream().noneMatch(d -> d.getId().equals(doc.getId()))) {
                        results.add(doc);
                    }
                }
            }
        }
        
        return results.stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
    
    public List<DoctorResponse> getTopRatedDoctors(int limit) {
        return doctorRepository.findTopRatedDoctors(PageRequest.of(0, limit))
                .stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
    
    public List<String> getAllLocations() {
        return doctorRepository.findAllLocations();
    }
    
    public List<DoctorResponse> getDoctorsByLocation(String location) {
        return doctorRepository.findByLocation(location)
                .stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
    
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDoctors", doctorRepository.countByIsActiveTrue());
        stats.put("totalSpecialties", doctorRepository.countDistinctRawSpecialties());
        stats.put("totalLocations", doctorRepository.findAllLocations().size());
        return stats;
    }
    
    /**
     * Get all unique specialties from the Doctor table's specialtyRaw column with doctor counts
     */
    public List<Map<String, Object>> getAllRawSpecialties() {
        List<Object[]> results = doctorRepository.findAllRawSpecialtiesWithCount();
        List<Map<String, Object>> specialties = new ArrayList<>();
        
        for (Object[] row : results) {
            String name = (String) row[0];
            Long count = (Long) row[1];
            
            if (name != null && !name.trim().isEmpty()) {
                Map<String, Object> specialty = new HashMap<>();
                specialty.put("name", name);
                specialty.put("displayName", getDisplayName(name));
                specialty.put("doctorCount", count);
                specialty.put("iconName", getIconForSpecialty(name));
                specialties.add(specialty);
            }
        }
        
        return specialties;
    }
    
    /**
     * Search specialties by name
     */
    public List<Map<String, Object>> searchRawSpecialties(String query) {
        return getAllRawSpecialties().stream()
                .filter(s -> {
                    String name = (String) s.get("name");
                    String displayName = (String) s.get("displayName");
                    return (name != null && name.toLowerCase().contains(query.toLowerCase())) ||
                           (displayName != null && displayName.toLowerCase().contains(query.toLowerCase()));
                })
                .collect(Collectors.toList());
    }
    
    /**
     * Get doctors by specialty raw name
     */
    public List<DoctorResponse> getDoctorsBySpecialtyRaw(String specialtyRaw) {
        return doctorRepository.findBySpecialtyRaw(specialtyRaw)
                .stream()
                .map(this::mapToDoctorResponse)
                .collect(Collectors.toList());
    }
    
    private String getIconForSpecialty(String specialtyName) {
        if (specialtyName == null) return "Stethoscope";
        String lower = specialtyName.toLowerCase();
        
        if (lower.contains("heart") || lower.contains("cardio") || lower.contains("cardiac")) return "Heart";
        if (lower.contains("brain") || lower.contains("neuro") || lower.contains("psychiatr")) return "Brain";
        if (lower.contains("bone") || lower.contains("orthop") || lower.contains("joint")) return "Bone";
        if (lower.contains("eye") || lower.contains("ophthalm") || lower.contains("vision")) return "Eye";
        if (lower.contains("child") || lower.contains("pediatr") || lower.contains("baby") || lower.contains("neonat")) return "Baby";
        if (lower.contains("gynec") || lower.contains("obstet") || lower.contains("women")) return "UserCircle";
        if (lower.contains("lung") || lower.contains("respir") || lower.contains("pulmon") || lower.contains("chest")) return "Wind";
        if (lower.contains("kidney") || lower.contains("nephro") || lower.contains("urol")) return "Droplets";
        if (lower.contains("diabetes") || lower.contains("endocrin") || lower.contains("hormone")) return "Activity";
        if (lower.contains("surg") || lower.contains("plastic")) return "Scissors";
        if (lower.contains("dent") || lower.contains("teeth") || lower.contains("maxillo")) return "Smile";
        if (lower.contains("skin") || lower.contains("dermat") || lower.contains("cosmet")) return "Sparkles";
        if (lower.contains("cancer") || lower.contains("oncol")) return "AlertTriangle";
        if (lower.contains("blood") || lower.contains("hemat")) return "Droplet";
        if (lower.contains("stomach") || lower.contains("gastro") || lower.contains("digest") || lower.contains("liver")) return "Cookie";
        if (lower.contains("ent") || lower.contains("ear") || lower.contains("nose") || lower.contains("throat")) return "Ear";
        if (lower.contains("nutri") || lower.contains("diet")) return "Apple";
        
        return "Stethoscope";
    }
    
    private SpecialtyResponse mapToSpecialtyResponse(Specialty specialty) {
        return SpecialtyResponse.builder()
                .id(specialty.getId())
                .name(specialty.getName())
                .displayName(specialty.getDisplayName())
                .description(specialty.getDescription())
                .iconName(specialty.getIconName())
                .slug(specialty.getSlug())
                .doctorCount(specialty.getDoctors() != null ? specialty.getDoctors().size() : 0)
                .build();
    }
    
    private DoctorResponse mapToDoctorResponse(Doctor doctor) {
        List<String> concentrationsList = new ArrayList<>();
        if (doctor.getConcentrations() != null && !doctor.getConcentrations().isEmpty()) {
            concentrationsList = Arrays.stream(doctor.getConcentrations().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList());
        }
        
        String specialtyName = doctor.getSpecialtyRaw();
        String specialtyDisplayName = getDisplayName(specialtyName);
        Long specialtyId = null;
        
        if (doctor.getSpecialty() != null) {
            specialtyName = doctor.getSpecialty().getName();
            specialtyDisplayName = doctor.getSpecialty().getDisplayName();
            specialtyId = doctor.getSpecialty().getId();
        }
        
        return DoctorResponse.builder()
                .id(doctor.getId())
                .name(doctor.getName())
                .education(doctor.getEducation())
                .specialty(specialtyName)
                .specialtyDisplayName(specialtyDisplayName)
                .specialtyId(specialtyId)
                .experienceYears(doctor.getExperienceYears())
                .chamber(doctor.getChamber())
                .location(doctor.getLocation())
                .concentrations(concentrationsList)
                .phone(doctor.getPhone())
                .email(doctor.getEmail())
                .imageUrl(doctor.getImageUrl())
                .consultationFee(doctor.getConsultationFee())
                .rating(doctor.getRating())
                .ratingCount(doctor.getRatingCount())
                .isAvailable(doctor.getIsAvailable())
                .build();
    }
}
