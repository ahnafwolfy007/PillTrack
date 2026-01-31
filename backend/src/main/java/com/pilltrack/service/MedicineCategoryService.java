package com.pilltrack.service;

import com.pilltrack.dto.request.MedicineCategoryRequest;
import com.pilltrack.dto.response.MedicineCategoryResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.ResourceAlreadyExistsException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.MedicineCategory;
import com.pilltrack.repository.MedicineCategoryRepository;
import com.pilltrack.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineCategoryService {
    
    private final MedicineCategoryRepository categoryRepository;
    
    public List<MedicineCategoryResponse> getAllCategories() {
        return categoryRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PageResponse<MedicineCategoryResponse> getCategoriesPaged(Pageable pageable) {
        Page<MedicineCategory> page = categoryRepository.findAll(pageable);
        List<MedicineCategoryResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return buildPageResponse(content, page);
    }
    
    public MedicineCategoryResponse getCategoryById(Long id) {
        MedicineCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToResponse(category);
    }
    
    public MedicineCategoryResponse getCategoryBySlug(String slug) {
        MedicineCategory category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return mapToResponse(category);
    }
    
    public PageResponse<MedicineCategoryResponse> searchCategories(String query, Pageable pageable) {
        Page<MedicineCategory> page = categoryRepository.search(query, pageable);
        List<MedicineCategoryResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return buildPageResponse(content, page);
    }
    
    @Transactional
    public MedicineCategoryResponse createCategory(MedicineCategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category", "name", request.getName());
        }
        
        MedicineCategory category = new MedicineCategory();
        category.setName(request.getName());
        category.setSlug(SlugUtils.generateSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setIconName(request.getIconName());
        category.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }
    
    @Transactional
    public MedicineCategoryResponse updateCategory(Long id, MedicineCategoryRequest request) {
        MedicineCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        
        if (!category.getName().equals(request.getName()) && 
                categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category", "name", request.getName());
        }
        
        category.setName(request.getName());
        category.setSlug(SlugUtils.generateSlug(request.getName()));
        category.setDescription(request.getDescription());
        category.setIconName(request.getIconName());
        if (request.getIsActive() != null) {
            category.setIsActive(request.getIsActive());
        }
        
        category = categoryRepository.save(category);
        return mapToResponse(category);
    }
    
    @Transactional
    public void deleteCategory(Long id) {
        MedicineCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }
    
    private MedicineCategoryResponse mapToResponse(MedicineCategory category) {
        return MedicineCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .iconName(category.getIconName())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
    
    private PageResponse<MedicineCategoryResponse> buildPageResponse(
            List<MedicineCategoryResponse> content, Page<MedicineCategory> page) {
        return PageResponse.<MedicineCategoryResponse>builder()
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
}
