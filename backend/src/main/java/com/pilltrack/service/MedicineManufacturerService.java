package com.pilltrack.service;

import com.pilltrack.dto.request.MedicineManufacturerRequest;
import com.pilltrack.dto.response.MedicineManufacturerResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.ResourceAlreadyExistsException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.MedicineManufacturer;
import com.pilltrack.repository.MedicineManufacturerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineManufacturerService {
    
    private final MedicineManufacturerRepository manufacturerRepository;
    
    public List<MedicineManufacturerResponse> getAllManufacturers() {
        return manufacturerRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PageResponse<MedicineManufacturerResponse> getManufacturersPaged(Pageable pageable) {
        Page<MedicineManufacturer> page = manufacturerRepository.findAll(pageable);
        List<MedicineManufacturerResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<MedicineManufacturerResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
    
    public MedicineManufacturerResponse getManufacturerById(Long id) {
        MedicineManufacturer manufacturer = manufacturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "id", id));
        return mapToResponse(manufacturer);
    }
    
    public MedicineManufacturerResponse getManufacturerByName(String name) {
        MedicineManufacturer manufacturer = manufacturerRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "name", name));
        return mapToResponse(manufacturer);
    }
    
    public PageResponse<MedicineManufacturerResponse> searchManufacturers(String query, Pageable pageable) {
        Page<MedicineManufacturer> page = manufacturerRepository.search(query, pageable);
        List<MedicineManufacturerResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<MedicineManufacturerResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
    
    @Transactional
    public MedicineManufacturerResponse createManufacturer(MedicineManufacturerRequest request) {
        if (manufacturerRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Manufacturer", "name", request.getName());
        }
        
        MedicineManufacturer manufacturer = new MedicineManufacturer();
        manufacturer.setName(request.getName());
        manufacturer.setDescription(request.getDescription());
        manufacturer.setLogoUrl(request.getLogoUrl());
        manufacturer.setWebsite(request.getWebsite());
        manufacturer.setCountry(request.getCountry());
        manufacturer.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        manufacturer = manufacturerRepository.save(manufacturer);
        return mapToResponse(manufacturer);
    }
    
    @Transactional
    public MedicineManufacturerResponse updateManufacturer(Long id, MedicineManufacturerRequest request) {
        MedicineManufacturer manufacturer = manufacturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "id", id));
        
        if (!manufacturer.getName().equals(request.getName()) && 
                manufacturerRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Manufacturer", "name", request.getName());
        }
        
        manufacturer.setName(request.getName());
        manufacturer.setDescription(request.getDescription());
        manufacturer.setLogoUrl(request.getLogoUrl());
        manufacturer.setWebsite(request.getWebsite());
        manufacturer.setCountry(request.getCountry());
        if (request.getIsActive() != null) {
            manufacturer.setIsActive(request.getIsActive());
        }
        
        manufacturer = manufacturerRepository.save(manufacturer);
        return mapToResponse(manufacturer);
    }
    
    @Transactional
    public void deleteManufacturer(Long id) {
        MedicineManufacturer manufacturer = manufacturerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Manufacturer", "id", id));
        manufacturerRepository.delete(manufacturer);
    }
    
    private MedicineManufacturerResponse mapToResponse(MedicineManufacturer manufacturer) {
        return MedicineManufacturerResponse.builder()
                .id(manufacturer.getId())
                .name(manufacturer.getName())
                .description(manufacturer.getDescription())
                .logoUrl(manufacturer.getLogoUrl())
                .website(manufacturer.getWebsite())
                .country(manufacturer.getCountry())
                .isActive(manufacturer.getIsActive())
                .medicineCount(manufacturer.getMedicines() != null ? (long) manufacturer.getMedicines().size() : 0L)
                .createdAt(manufacturer.getCreatedAt())
                .build();
    }
}
