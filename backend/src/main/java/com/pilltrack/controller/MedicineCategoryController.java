package com.pilltrack.controller;

import com.pilltrack.dto.request.MedicineCategoryRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.MedicineCategoryResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.service.MedicineCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Medicine Categories", description = "Medicine category management endpoints")
public class MedicineCategoryController {
    
    private final MedicineCategoryService categoryService;
    
    @GetMapping
    @Operation(summary = "Get all categories")
    public ResponseEntity<ApiResponse<List<MedicineCategoryResponse>>> getAllCategories() {
        List<MedicineCategoryResponse> response = categoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/paged")
    @Operation(summary = "Get categories with pagination")
    public ResponseEntity<ApiResponse<PageResponse<MedicineCategoryResponse>>> getCategoriesPaged(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineCategoryResponse> response = categoryService.getCategoriesPaged(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID")
    public ResponseEntity<ApiResponse<MedicineCategoryResponse>> getCategoryById(@PathVariable Long id) {
        MedicineCategoryResponse response = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get category by slug")
    public ResponseEntity<ApiResponse<MedicineCategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        MedicineCategoryResponse response = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search categories by name")
    public ResponseEntity<ApiResponse<PageResponse<MedicineCategoryResponse>>> searchCategories(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineCategoryResponse> response = categoryService.searchCategories(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new category (Admin only)")
    public ResponseEntity<ApiResponse<MedicineCategoryResponse>> createCategory(
            @Valid @RequestBody MedicineCategoryRequest request) {
        MedicineCategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Category created successfully"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a category (Admin only)")
    public ResponseEntity<ApiResponse<MedicineCategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody MedicineCategoryRequest request) {
        MedicineCategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Category updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a category (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Category deleted successfully"));
    }
}
