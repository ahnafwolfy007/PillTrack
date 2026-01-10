package com.pilltrack.service;

import com.pilltrack.dto.request.MedicineRequest;
import com.pilltrack.dto.response.*;
import com.pilltrack.exception.ResourceAlreadyExistsException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Medicine;
import com.pilltrack.model.entity.MedicineCategory;
import com.pilltrack.model.entity.MedicineManufacturer;
import com.pilltrack.repository.MedicineCategoryRepository;
import com.pilltrack.repository.MedicineManufacturerRepository;
import com.pilltrack.repository.MedicineRepository;
import com.pilltrack.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicineService {
    
    private final MedicineRepository medicineRepository;
    private final MedicineCategoryRepository categoryRepository;
    private final MedicineManufacturerRepository manufacturerRepository;
    
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        
        // Increment view count
        medicineRepository.incrementViewCount(id);
        
        return mapToFullResponse(medicine);
    }
    
    @Transactional(readOnly = true)
    public MedicineResponse getMedicineBySlug(String slug) {
        Medicine medicine = medicineRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "slug", slug));
        
        // Increment view count
        medicineRepository.incrementViewCount(medicine.getId());
        
        return mapToFullResponse(medicine);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> searchMedicines(String query, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.fullTextSearch(query, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getAllMedicines(Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByIsActiveTrue(pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByGenericName(String genericName, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByGenericNameContainingIgnoreCaseAndIsActiveTrue(genericName, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public List<MedicineAlternativeResponse> getMedicineAlternatives(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        
        // Find medicines with the same generic name (alternatives)
        return medicineRepository.findByGenericNameAndIdNot(medicine.getGenericName(), id).stream()
                .limit(10)
                .map(m -> MedicineAlternativeResponse.builder()
                        .id(m.getId())
                        .brandName(m.getBrandName())
                        .genericName(m.getGenericName())
                        .strength(m.getStrength())
                        .form(m.getForm())
                        .slug(m.getSlug())
                        .manufacturerName(m.getManufacturer() != null ? m.getManufacturer().getName() : null)
                        .build())
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getOtcMedicines(Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByRequiresPrescriptionFalseAndIsActiveTrue(pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByCategory(Long categoryId, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByCategoryIdAndIsActiveTrue(categoryId, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByManufacturer(Long manufacturerId, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByManufacturerIdAndIsActiveTrue(manufacturerId, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByForm(String form, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByForm(form, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getPopularMedicines(Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findPopular(pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllForms() {
        return medicineRepository.findAllForms();
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllTherapeuticClasses() {
        return medicineRepository.findAllTherapeuticClasses();
    }
    
    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        String slug = SlugUtils.generateSlug(request.getBrandName() + " " + request.getStrength());
        
        if (medicineRepository.existsBySlug(slug)) {
            throw new ResourceAlreadyExistsException("Medicine", "slug", slug);
        }
        
        MedicineCategory category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        }
        
        MedicineManufacturer manufacturer = null;
        if (request.getManufacturerId() != null) {
            manufacturer = manufacturerRepository.findById(request.getManufacturerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "id", request.getManufacturerId()));
        }
        
        Medicine medicine = Medicine.builder()
                .brandName(request.getBrandName())
                .genericName(request.getGenericName())
                .slug(slug)
                .strength(request.getStrength())
                .form(request.getForm())
                .composition(request.getComposition())
                .category(category)
                .therapeuticClass(request.getTherapeuticClass())
                .manufacturer(manufacturer)
                .description(request.getDescription())
                .indications(request.getIndications())
                .dosageAdults(request.getDosageAdults())
                .dosageChildren(request.getDosageChildren())
                .dosageElderly(request.getDosageElderly())
                .administration(request.getAdministration())
                .sideEffects(request.getSideEffects())
                .contraindications(request.getContraindications())
                .warnings(request.getWarnings())
                .precautions(request.getPrecautions())
                .drugInteractions(request.getDrugInteractions())
                .foodInteractions(request.getFoodInteractions())
                .pregnancyCategory(request.getPregnancyCategory())
                .pregnancyInfo(request.getPregnancyInfo())
                .lactationInfo(request.getLactationInfo())
                .overdoseInfo(request.getOverdoseInfo())
                .storageConditions(request.getStorageConditions())
                .requiresPrescription(request.getRequiresPrescription() != null ? request.getRequiresPrescription() : false)
                .scheduleType(request.getScheduleType())
                .pharmacology(request.getPharmacology())
                .pharmacokinetics(request.getPharmacokinetics())
                .halfLife(request.getHalfLife())
                .onsetOfAction(request.getOnsetOfAction())
                .durationOfAction(request.getDurationOfAction())
                .packSizes(request.getPackSizes())
                .color(request.getColor())
                .shape(request.getShape())
                .imprint(request.getImprint())
                .keywords(request.getKeywords())
                .imageUrl(request.getImageUrl())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .approvalDate(request.getApprovalDate())
                .approvalAuthority(request.getApprovalAuthority())
                .build();
        
        medicine = medicineRepository.save(medicine);
        
        log.info("Medicine created: {} ({})", medicine.getBrandName(), medicine.getSlug());
        
        return mapToFullResponse(medicine);
    }
    
    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        
        // Update fields
        if (request.getBrandName() != null) medicine.setBrandName(request.getBrandName());
        if (request.getGenericName() != null) medicine.setGenericName(request.getGenericName());
        if (request.getStrength() != null) medicine.setStrength(request.getStrength());
        if (request.getForm() != null) medicine.setForm(request.getForm());
        if (request.getComposition() != null) medicine.setComposition(request.getComposition());
        if (request.getTherapeuticClass() != null) medicine.setTherapeuticClass(request.getTherapeuticClass());
        if (request.getDescription() != null) medicine.setDescription(request.getDescription());
        if (request.getIndications() != null) medicine.setIndications(request.getIndications());
        if (request.getDosageAdults() != null) medicine.setDosageAdults(request.getDosageAdults());
        if (request.getDosageChildren() != null) medicine.setDosageChildren(request.getDosageChildren());
        if (request.getDosageElderly() != null) medicine.setDosageElderly(request.getDosageElderly());
        if (request.getAdministration() != null) medicine.setAdministration(request.getAdministration());
        if (request.getSideEffects() != null) medicine.setSideEffects(request.getSideEffects());
        if (request.getContraindications() != null) medicine.setContraindications(request.getContraindications());
        if (request.getWarnings() != null) medicine.setWarnings(request.getWarnings());
        if (request.getPrecautions() != null) medicine.setPrecautions(request.getPrecautions());
        if (request.getDrugInteractions() != null) medicine.setDrugInteractions(request.getDrugInteractions());
        if (request.getFoodInteractions() != null) medicine.setFoodInteractions(request.getFoodInteractions());
        if (request.getPregnancyCategory() != null) medicine.setPregnancyCategory(request.getPregnancyCategory());
        if (request.getPregnancyInfo() != null) medicine.setPregnancyInfo(request.getPregnancyInfo());
        if (request.getLactationInfo() != null) medicine.setLactationInfo(request.getLactationInfo());
        if (request.getOverdoseInfo() != null) medicine.setOverdoseInfo(request.getOverdoseInfo());
        if (request.getStorageConditions() != null) medicine.setStorageConditions(request.getStorageConditions());
        if (request.getRequiresPrescription() != null) medicine.setRequiresPrescription(request.getRequiresPrescription());
        if (request.getScheduleType() != null) medicine.setScheduleType(request.getScheduleType());
        if (request.getPharmacology() != null) medicine.setPharmacology(request.getPharmacology());
        if (request.getPharmacokinetics() != null) medicine.setPharmacokinetics(request.getPharmacokinetics());
        if (request.getHalfLife() != null) medicine.setHalfLife(request.getHalfLife());
        if (request.getOnsetOfAction() != null) medicine.setOnsetOfAction(request.getOnsetOfAction());
        if (request.getDurationOfAction() != null) medicine.setDurationOfAction(request.getDurationOfAction());
        if (request.getPackSizes() != null) medicine.setPackSizes(request.getPackSizes());
        if (request.getColor() != null) medicine.setColor(request.getColor());
        if (request.getShape() != null) medicine.setShape(request.getShape());
        if (request.getImprint() != null) medicine.setImprint(request.getImprint());
        if (request.getKeywords() != null) medicine.setKeywords(request.getKeywords());
        if (request.getImageUrl() != null) medicine.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null) medicine.setIsActive(request.getIsActive());
        if (request.getApprovalDate() != null) medicine.setApprovalDate(request.getApprovalDate());
        if (request.getApprovalAuthority() != null) medicine.setApprovalAuthority(request.getApprovalAuthority());
        
        // Update category if provided
        if (request.getCategoryId() != null) {
            MedicineCategory category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
            medicine.setCategory(category);
        }
        
        // Update manufacturer if provided
        if (request.getManufacturerId() != null) {
            MedicineManufacturer manufacturer = manufacturerRepository.findById(request.getManufacturerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "id", request.getManufacturerId()));
            medicine.setManufacturer(manufacturer);
        }
        
        medicine = medicineRepository.save(medicine);
        
        log.info("Medicine updated: {}", medicine.getBrandName());
        
        return mapToFullResponse(medicine);
    }
    
    @Transactional
    public void deleteMedicine(Long id) {
        Medicine medicine = medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", id));
        
        medicine.setIsActive(false);
        medicineRepository.save(medicine);
        
        log.info("Medicine deactivated: {}", medicine.getBrandName());
    }
    
    private MedicineResponse mapToFullResponse(Medicine medicine) {
        MedicineCategoryResponse categoryResponse = null;
        if (medicine.getCategory() != null) {
            categoryResponse = MedicineCategoryResponse.builder()
                    .id(medicine.getCategory().getId())
                    .name(medicine.getCategory().getName())
                    .slug(medicine.getCategory().getSlug())
                    .description(medicine.getCategory().getDescription())
                    .iconName(medicine.getCategory().getIconName())
                    .isActive(medicine.getCategory().getIsActive())
                    .build();
        }
        
        MedicineManufacturerResponse manufacturerResponse = null;
        if (medicine.getManufacturer() != null) {
            manufacturerResponse = MedicineManufacturerResponse.builder()
                    .id(medicine.getManufacturer().getId())
                    .name(medicine.getManufacturer().getName())
                    .country(medicine.getManufacturer().getCountry())
                    .description(medicine.getManufacturer().getDescription())
                    .website(medicine.getManufacturer().getWebsite())
                    .logoUrl(medicine.getManufacturer().getLogoUrl())
                    .isActive(medicine.getManufacturer().getIsActive())
                    .build();
        }
        
        // Get alternatives
        List<MedicineAlternativeResponse> alternatives = medicineRepository
                .findAlternatives(medicine.getGenericName(), medicine.getId())
                .stream()
                .limit(5)
                .map(alt -> MedicineAlternativeResponse.builder()
                        .id(alt.getId())
                        .brandName(alt.getBrandName())
                        .genericName(alt.getGenericName())
                        .slug(alt.getSlug())
                        .strength(alt.getStrength())
                        .form(alt.getForm())
                        .manufacturerName(alt.getManufacturer() != null ? alt.getManufacturer().getName() : null)
                        .imageUrl(alt.getImageUrl())
                        .build())
                .collect(Collectors.toList());
        
        return MedicineResponse.builder()
                .id(medicine.getId())
                .brandName(medicine.getBrandName())
                .genericName(medicine.getGenericName())
                .slug(medicine.getSlug())
                .strength(medicine.getStrength())
                .form(medicine.getForm())
                .composition(medicine.getComposition())
                .category(categoryResponse)
                .therapeuticClass(medicine.getTherapeuticClass())
                .manufacturer(manufacturerResponse)
                .description(medicine.getDescription())
                .indications(medicine.getIndications())
                .dosageAdults(medicine.getDosageAdults())
                .dosageChildren(medicine.getDosageChildren())
                .dosageElderly(medicine.getDosageElderly())
                .administration(medicine.getAdministration())
                .sideEffects(medicine.getSideEffects())
                .contraindications(medicine.getContraindications())
                .warnings(medicine.getWarnings())
                .precautions(medicine.getPrecautions())
                .drugInteractions(medicine.getDrugInteractions())
                .foodInteractions(medicine.getFoodInteractions())
                .pregnancyCategory(medicine.getPregnancyCategory())
                .pregnancyInfo(medicine.getPregnancyInfo())
                .lactationInfo(medicine.getLactationInfo())
                .overdoseInfo(medicine.getOverdoseInfo())
                .storageConditions(medicine.getStorageConditions())
                .requiresPrescription(medicine.getRequiresPrescription())
                .scheduleType(medicine.getScheduleType())
                .pharmacology(medicine.getPharmacology())
                .pharmacokinetics(medicine.getPharmacokinetics())
                .halfLife(medicine.getHalfLife())
                .onsetOfAction(medicine.getOnsetOfAction())
                .durationOfAction(medicine.getDurationOfAction())
                .packSizes(medicine.getPackSizes())
                .color(medicine.getColor())
                .shape(medicine.getShape())
                .imprint(medicine.getImprint())
                .keywords(medicine.getKeywords())
                .imageUrl(medicine.getImageUrl())
                .isActive(medicine.getIsActive())
                .approvalDate(medicine.getApprovalDate())
                .approvalAuthority(medicine.getApprovalAuthority())
                .viewCount(medicine.getViewCount())
                .alternatives(alternatives)
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
    
    private MedicineSummaryResponse mapToSummaryResponse(Medicine medicine) {
        return MedicineSummaryResponse.builder()
                .id(medicine.getId())
                .brandName(medicine.getBrandName())
                .genericName(medicine.getGenericName())
                .slug(medicine.getSlug())
                .strength(medicine.getStrength())
                .form(medicine.getForm())
                .categoryName(medicine.getCategory() != null ? medicine.getCategory().getName() : null)
                .manufacturerName(medicine.getManufacturer() != null ? medicine.getManufacturer().getName() : null)
                .requiresPrescription(medicine.getRequiresPrescription())
                .imageUrl(medicine.getImageUrl())
                .build();
    }
    
    private PageResponse<MedicineSummaryResponse> buildSummaryPageResponse(Page<Medicine> medicinesPage) {
        List<MedicineSummaryResponse> medicines = medicinesPage.getContent().stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<MedicineSummaryResponse>builder()
                .content(medicines)
                .pageNumber(medicinesPage.getNumber())
                .pageSize(medicinesPage.getSize())
                .totalElements(medicinesPage.getTotalElements())
                .totalPages(medicinesPage.getTotalPages())
                .first(medicinesPage.isFirst())
                .last(medicinesPage.isLast())
                .hasNext(medicinesPage.hasNext())
                .hasPrevious(medicinesPage.hasPrevious())
                .build();
    }
}
