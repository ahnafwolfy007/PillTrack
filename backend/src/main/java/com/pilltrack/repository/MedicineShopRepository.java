package com.pilltrack.repository;

import com.pilltrack.model.entity.MedicineShop;
import com.pilltrack.model.enums.ShopStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineShopRepository extends JpaRepository<MedicineShop, Long> {
    
    Optional<MedicineShop> findBySlug(String slug);
    
    Optional<MedicineShop> findByOwnerId(Long ownerId);
    
    boolean existsBySlug(String slug);
    
    boolean existsByOwnerId(Long ownerId);
    
    boolean existsByLicenseNumber(String licenseNumber);
    
    // Find active and verified shops
    Page<MedicineShop> findByStatusAndIsActiveTrue(ShopStatus status, Pageable pageable);
    
    List<MedicineShop> findByStatusAndIsActiveTrue(ShopStatus status);
    
    // Search shops
    @Query("SELECT s FROM MedicineShop s WHERE s.status = 'ACTIVE' AND s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.city) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.area) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<MedicineShop> search(@Param("query") String query, Pageable pageable);
    
    // Find shops by city
    @Query("SELECT s FROM MedicineShop s WHERE s.status = 'ACTIVE' AND s.isActive = true AND LOWER(s.city) = LOWER(:city)")
    Page<MedicineShop> findByCity(@Param("city") String city, Pageable pageable);
    
    // Find shops pending verification
    @Query("SELECT s FROM MedicineShop s WHERE s.status = 'PENDING' ORDER BY s.createdAt")
    List<MedicineShop> findPendingVerification();
    
    // Find top rated shops
    @Query("SELECT s FROM MedicineShop s WHERE s.status = 'ACTIVE' AND s.isActive = true ORDER BY s.rating DESC")
    Page<MedicineShop> findTopRated(Pageable pageable);
    
    // Get distinct cities
    @Query("SELECT DISTINCT s.city FROM MedicineShop s WHERE s.status = 'ACTIVE' AND s.isActive = true ORDER BY s.city")
    List<String> findAllCities();
    
    // Count by status
    long countByStatus(ShopStatus status);
    
    // Count verified shops
    long countByIsVerifiedTrue();
    
    // Find all shops with latitude and longitude (for map display)
    @Query("SELECT s FROM MedicineShop s WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL AND s.isActive = true")
    List<MedicineShop> findAllWithLocation();
    
    // Find shops by area or ward
    @Query("SELECT s FROM MedicineShop s WHERE s.isActive = true AND (LOWER(s.area) = LOWER(:area) OR LOWER(s.ward) = LOWER(:ward))")
    List<MedicineShop> findByAreaOrWard(@Param("area") String area, @Param("ward") String ward);
    
    // Find all verified/active shops with location for pharmacy finder
    @Query("SELECT s FROM MedicineShop s WHERE s.status = 'VERIFIED' AND s.isActive = true AND s.latitude IS NOT NULL AND s.longitude IS NOT NULL")
    List<MedicineShop> findAllActiveWithLocation();
}
