package com.pilltrack.repository;

import com.pilltrack.model.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long>, JpaSpecificationExecutor<Medicine> {
    
    Optional<Medicine> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    // Search by brand name or generic name
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND " +
           "(LOWER(m.brandName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Medicine> searchByName(@Param("query") String query, Pageable pageable);
    
    // Full-text search across multiple fields
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND " +
           "(LOWER(m.brandName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.composition) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.therapeuticClass) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.keywords) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Medicine> fullTextSearch(@Param("query") String query, Pageable pageable);
    
    // Find by category
    Page<Medicine> findByCategoryIdAndIsActiveTrue(Long categoryId, Pageable pageable);
    
    List<Medicine> findByCategoryIdAndIsActiveTrue(Long categoryId);
    
    // Find by manufacturer
    Page<Medicine> findByManufacturerIdAndIsActiveTrue(Long manufacturerId, Pageable pageable);
    
    List<Medicine> findByManufacturerIdAndIsActiveTrue(Long manufacturerId);
    
    // Find by form (tablet, syrup, etc.)
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.form) = LOWER(:form)")
    Page<Medicine> findByForm(@Param("form") String form, Pageable pageable);
    
    // Find by therapeutic class
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.therapeuticClass) = LOWER(:therapeuticClass)")
    Page<Medicine> findByTherapeuticClass(@Param("therapeuticClass") String therapeuticClass, Pageable pageable);
    
    // Find prescription vs OTC medicines
    Page<Medicine> findByRequiresPrescriptionAndIsActiveTrue(Boolean requiresPrescription, Pageable pageable);
    
    // Get distinct forms
    @Query("SELECT DISTINCT m.form FROM Medicine m WHERE m.isActive = true ORDER BY m.form")
    List<String> findAllForms();
    
    // Get distinct therapeutic classes
    @Query("SELECT DISTINCT m.therapeuticClass FROM Medicine m WHERE m.isActive = true AND m.therapeuticClass IS NOT NULL ORDER BY m.therapeuticClass")
    List<String> findAllTherapeuticClasses();
    
    // Increment view count
    @Modifying
    @Query("UPDATE Medicine m SET m.viewCount = m.viewCount + 1 WHERE m.id = :id")
    void incrementViewCount(@Param("id") Long id);
    
    // Find popular medicines
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true ORDER BY m.viewCount DESC")
    Page<Medicine> findPopular(Pageable pageable);
    
    // Count by category
    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.category.id = :categoryId AND m.isActive = true")
    long countByCategoryId(@Param("categoryId") Long categoryId);
    
    // Count by manufacturer
    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.manufacturer.id = :manufacturerId AND m.isActive = true")
    long countByManufacturerId(@Param("manufacturerId") Long manufacturerId);
    
    // Find by generic name for alternatives
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.genericName) = LOWER(:genericName) AND m.id != :excludeId")
    List<Medicine> findAlternatives(@Param("genericName") String genericName, @Param("excludeId") Long excludeId);
    
    // Find all active medicines
    Page<Medicine> findByIsActiveTrue(Pageable pageable);
    
    // Find by generic name containing
    Page<Medicine> findByGenericNameContainingIgnoreCaseAndIsActiveTrue(String genericName, Pageable pageable);
    
    // Find OTC medicines
    Page<Medicine> findByRequiresPrescriptionFalseAndIsActiveTrue(Pageable pageable);
    
    // Find by generic name and excluding one id
    List<Medicine> findByGenericNameAndIdNot(String genericName, Long id);
}
