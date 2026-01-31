package com.pilltrack.repository;

import com.pilltrack.model.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.user.id = :userId")
    List<OrderItem> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.shopMedicine.shop.id = :shopId")
    List<OrderItem> findByShopId(@Param("shopId") Long shopId);
    
    // Most ordered medicines for a shop
    @Query("SELECT oi.shopMedicine.medicine.brandName, SUM(oi.quantity) as totalQty FROM OrderItem oi " +
           "WHERE oi.shopMedicine.shop.id = :shopId AND oi.order.status = 'DELIVERED' " +
           "GROUP BY oi.shopMedicine.medicine.brandName ORDER BY totalQty DESC")
    List<Object[]> findTopSellingMedicinesByShopId(@Param("shopId") Long shopId);
}
