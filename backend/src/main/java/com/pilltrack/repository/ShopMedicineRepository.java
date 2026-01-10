package com.pilltrack.repository;

import com.pilltrack.model.entity.ShopMedicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShopMedicineRepository extends JpaRepository<ShopMedicine, Long>, JpaSpecificationExecutor<ShopMedicine> {
    
    Optional<ShopMedicine> findByShopIdAndMedicineId(Long shopId, Long medicineId);
    
    boolean existsByShopIdAndMedicineId(Long shopId, Long medicineId);
    
    // Find by shop
    Page<ShopMedicine> findByShopIdAndIsAvailableTrue(Long shopId, Pageable pageable);
    
    List<ShopMedicine> findByShopIdAndIsAvailableTrue(Long shopId);
    
    // Find by medicine
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.medicine.id = :medicineId AND sm.isAvailable = true AND sm.shop.status = 'ACTIVE'")
    Page<ShopMedicine> findByMedicineId(@Param("medicineId") Long medicineId, Pageable pageable);
    
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.medicine.id = :medicineId AND sm.isAvailable = true AND sm.shop.status = 'ACTIVE'")
    List<ShopMedicine> findByMedicineId(@Param("medicineId") Long medicineId);
    
    // Search shop medicines
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.shop.id = :shopId AND sm.isAvailable = true AND " +
           "(LOWER(sm.medicine.brandName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(sm.medicine.genericName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<ShopMedicine> searchByShopId(@Param("shopId") Long shopId, @Param("query") String query, Pageable pageable);
    
    // Find featured products
    Page<ShopMedicine> findByShopIdAndIsFeaturedTrueAndIsAvailableTrue(Long shopId, Pageable pageable);
    
    // Find low stock items
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.shop.id = :shopId AND sm.stockQuantity <= sm.minStockAlert")
    List<ShopMedicine> findLowStockByShopId(@Param("shopId") Long shopId);
    
    // Find out of stock items
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.shop.id = :shopId AND sm.stockQuantity = 0")
    List<ShopMedicine> findOutOfStockByShopId(@Param("shopId") Long shopId);
    
    // Find expiring soon items
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.shop.id = :shopId AND sm.expiryDate <= :date")
    List<ShopMedicine> findExpiringSoonByShopId(@Param("shopId") Long shopId, @Param("date") LocalDate date);
    
    // Price range search
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.isAvailable = true AND sm.shop.status = 'ACTIVE' AND " +
           "sm.medicine.id = :medicineId AND " +
           "(sm.discountPrice BETWEEN :minPrice AND :maxPrice OR " +
           "(sm.discountPrice IS NULL AND sm.price BETWEEN :minPrice AND :maxPrice))")
    List<ShopMedicine> findByMedicineIdAndPriceRange(@Param("medicineId") Long medicineId,
                                                      @Param("minPrice") BigDecimal minPrice,
                                                      @Param("maxPrice") BigDecimal maxPrice);
    
    // Find cheapest option for a medicine
    @Query("SELECT sm FROM ShopMedicine sm WHERE sm.medicine.id = :medicineId AND sm.isAvailable = true AND sm.shop.status = 'ACTIVE' " +
           "ORDER BY COALESCE(sm.discountPrice, sm.price) ASC")
    List<ShopMedicine> findCheapestByMedicineId(@Param("medicineId") Long medicineId, Pageable pageable);
    
    // Update stock
    @Modifying
    @Query("UPDATE ShopMedicine sm SET sm.stockQuantity = sm.stockQuantity - :quantity WHERE sm.id = :id AND sm.stockQuantity >= :quantity")
    int decrementStock(@Param("id") Long id, @Param("quantity") int quantity);
    
    @Modifying
    @Query("UPDATE ShopMedicine sm SET sm.stockQuantity = sm.stockQuantity + :quantity WHERE sm.id = :id")
    int incrementStock(@Param("id") Long id, @Param("quantity") int quantity);
    
    // Increment sold count
    @Modifying
    @Query("UPDATE ShopMedicine sm SET sm.soldCount = sm.soldCount + :quantity WHERE sm.id = :id")
    void incrementSoldCount(@Param("id") Long id, @Param("quantity") int quantity);
    
    // Count products by shop
    long countByShopId(Long shopId);
    
    long countByShopIdAndIsAvailableTrue(Long shopId);
}
