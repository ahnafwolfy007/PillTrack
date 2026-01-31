package com.pilltrack.service;

import com.pilltrack.dto.response.*;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Medicine;
import com.pilltrack.repository.MedicineRepository;
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
    public PageResponse<MedicineSummaryResponse> getMedicinesByType(String type, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByType(type, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByGenericName(String genericName, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByGenericNameContaining(genericName, pageable);
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
                        .dosageForm(m.getDosageForm())
                        .slug(m.getSlug())
                        .manufacturerName(m.getManufacturer() != null ? m.getManufacturer().getName() : null)
                        .unitPrice(m.getUnitPrice())
                        .build())
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByManufacturer(Long manufacturerId, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByManufacturerIdAndIsActiveTrue(manufacturerId, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getMedicinesByDosageForm(String dosageForm, Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findByDosageForm(dosageForm, pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicineSummaryResponse> getPopularMedicines(Pageable pageable) {
        Page<Medicine> medicinesPage = medicineRepository.findPopular(pageable);
        return buildSummaryPageResponse(medicinesPage);
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllTypes() {
        return medicineRepository.findAllTypes();
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllDosageForms() {
        return medicineRepository.findAllDosageForms();
    }
    
    @Transactional(readOnly = true)
    public List<String> getAllGenericNames() {
        return medicineRepository.findAllGenericNames();
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
        MedicineManufacturerResponse manufacturerResponse = null;
        if (medicine.getManufacturer() != null) {
            manufacturerResponse = MedicineManufacturerResponse.builder()
                    .id(medicine.getManufacturer().getId())
                    .name(medicine.getManufacturer().getName())
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
                        .dosageForm(alt.getDosageForm())
                        .manufacturerName(alt.getManufacturer() != null ? alt.getManufacturer().getName() : null)
                        .unitPrice(alt.getUnitPrice())
                        .build())
                .collect(Collectors.toList());
        
        return MedicineResponse.builder()
                .id(medicine.getId())
                .brandId(medicine.getBrandId())
                .brandName(medicine.getBrandName())
                .type(medicine.getType())
                .slug(medicine.getSlug())
                .dosageForm(medicine.getDosageForm())
                .genericName(medicine.getGenericName())
                .strength(medicine.getStrength())
                .manufacturer(manufacturerResponse)
                .manufacturerName(medicine.getManufacturer() != null ? medicine.getManufacturer().getName() : null)
                .unitQuantity(medicine.getUnitQuantity())
                .containerType(medicine.getContainerType())
                .unitPrice(medicine.getUnitPrice())
                .packQuantity(medicine.getPackQuantity())
                .packPrice(medicine.getPackPrice())
                .isActive(medicine.getIsActive())
                .viewCount(medicine.getViewCount())
                .alternatives(alternatives)
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
    
    private MedicineSummaryResponse mapToSummaryResponse(Medicine medicine) {
        return MedicineSummaryResponse.builder()
                .id(medicine.getId())
                .brandId(medicine.getBrandId())
                .brandName(medicine.getBrandName())
                .genericName(medicine.getGenericName())
                .slug(medicine.getSlug())
                .type(medicine.getType())
                .dosageForm(medicine.getDosageForm())
                .strength(medicine.getStrength())
                .manufacturerName(medicine.getManufacturer() != null ? medicine.getManufacturer().getName() : null)
                .containerType(medicine.getContainerType())
                .unitPrice(medicine.getUnitPrice())
                .packPrice(medicine.getPackPrice())
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
