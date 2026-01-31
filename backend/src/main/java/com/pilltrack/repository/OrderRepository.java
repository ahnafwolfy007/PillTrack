package com.pilltrack.repository;

import com.pilltrack.model.entity.Order;
import com.pilltrack.model.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    boolean existsByOrderNumber(String orderNumber);
    
    // Find by user
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Find by shop
    Page<Order> findByShopIdOrderByCreatedAtDesc(Long shopId, Pageable pageable);
    
    List<Order> findByShopIdOrderByCreatedAtDesc(Long shopId);
    
    // Find by status
    Page<Order> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, OrderStatus status, Pageable pageable);
    
    Page<Order> findByShopIdAndStatusOrderByCreatedAtDesc(Long shopId, OrderStatus status, Pageable pageable);
    
    // Find orders in date range
    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByUserIdAndDateRange(@Param("userId") Long userId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.createdAt BETWEEN :startDate AND :endDate ORDER BY o.createdAt DESC")
    List<Order> findByShopIdAndDateRange(@Param("shopId") Long shopId,
                                          @Param("startDate") LocalDateTime startDate,
                                          @Param("endDate") LocalDateTime endDate);
    
    // Count by status
    long countByUserIdAndStatus(Long userId, OrderStatus status);
    
    long countByShopIdAndStatus(Long shopId, OrderStatus status);
    
    long countByShopId(Long shopId);
    
    // Count and find by status
    long countByStatus(OrderStatus status);
    
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    
    List<Order> findAllByStatus(OrderStatus status);
    
    // Find by date range
    List<Order> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Revenue calculation
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.shop.id = :shopId AND o.status = 'DELIVERED'")
    BigDecimal calculateTotalRevenueByShopId(@Param("shopId") Long shopId);
    
    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.shop.id = :shopId AND o.status = 'DELIVERED' AND o.deliveredAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateRevenueByShopIdAndDateRange(@Param("shopId") Long shopId,
                                                     @Param("startDate") LocalDateTime startDate,
                                                     @Param("endDate") LocalDateTime endDate);
    
    // Pending orders requiring attention
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.status IN ('PENDING', 'CONFIRMED') ORDER BY o.createdAt")
    List<Order> findPendingOrdersByShopId(@Param("shopId") Long shopId);
    
    // Orders requiring prescription verification
    @Query("SELECT o FROM Order o WHERE o.shop.id = :shopId AND o.requiresPrescription = true AND o.prescriptionVerified = false")
    List<Order> findOrdersRequiringPrescriptionVerification(@Param("shopId") Long shopId);
}
