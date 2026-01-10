package com.pilltrack.service;

import com.pilltrack.dto.request.OrderRequest;
import com.pilltrack.dto.request.OrderStatusUpdateRequest;
import com.pilltrack.dto.response.OrderResponse;
import com.pilltrack.dto.response.OrderItemResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.*;
import com.pilltrack.model.enums.OrderStatus;
import com.pilltrack.model.enums.PaymentStatus;
import com.pilltrack.repository.*;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final ShopMedicineRepository shopMedicineRepository;
    private final MedicineShopRepository shopRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;
    
    public PageResponse<OrderResponse> getCurrentUserOrders(Pageable pageable) {
        User user = currentUser.getUser();
        Page<Order> page = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return mapToPageResponse(page);
    }
    
    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        
        User user = currentUser.getUser();
        if (!order.getUser().getId().equals(user.getId()) && 
                !order.getShop().getOwner().getId().equals(user.getId()) &&
                !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to view this order");
        }
        
        return mapToResponse(order);
    }
    
    public OrderResponse getOrderByNumber(String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "orderNumber", orderNumber));
        
        User user = currentUser.getUser();
        if (!order.getUser().getId().equals(user.getId()) && 
                !order.getShop().getOwner().getId().equals(user.getId()) &&
                !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to view this order");
        }
        
        return mapToResponse(order);
    }
    
    public List<OrderResponse> getCurrentUserOrdersByStatus(OrderStatus status) {
        User user = currentUser.getUser();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(o -> o.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PageResponse<OrderResponse> getShopOwnerOrders(Pageable pageable) {
        User user = currentUser.getUser();
        MedicineShop shop = shopRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "owner", user.getEmail()));
        Page<Order> page = orderRepository.findByShopIdOrderByCreatedAtDesc(shop.getId(), pageable);
        return mapToPageResponse(page);
    }
    
    public List<OrderResponse> getShopOrdersByStatus(OrderStatus status) {
        User user = currentUser.getUser();
        MedicineShop shop = shopRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "owner", user.getEmail()));
        return orderRepository.findByShopIdOrderByCreatedAtDesc(shop.getId()).stream()
                .filter(o -> o.getStatus() == status)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        return mapToPageResponse(page);
    }
    
    public long getTotalOrderCount() {
        return orderRepository.count();
    }
    
    public long getOrderCountByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }
    
    public BigDecimal getTotalRevenue() {
        return orderRepository.findAllByStatus(OrderStatus.DELIVERED).stream()
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    public PageResponse<OrderResponse> getOrdersByStatus(OrderStatus status, Pageable pageable) {
        Page<Order> page = orderRepository.findByStatus(status, pageable);
        return mapToPageResponse(page);
    }
    
    public List<OrderResponse> getOrdersByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        return orderRepository.findByCreatedAtBetween(startDateTime, endDateTime).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        User user = currentUser.getUser();
        
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Order must have at least one item");
        }
        
        // Get shop from first item
        ShopMedicine firstItem = shopMedicineRepository.findById(request.getItems().get(0).getShopMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop Medicine", "id", 
                        request.getItems().get(0).getShopMedicineId()));
        MedicineShop shop = firstItem.getShop();
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setShop(shop);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingName(request.getShippingName());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setShippingArea(request.getShippingArea());
        order.setShippingPostalCode(request.getShippingPostalCode());
        order.setCustomerNotes(request.getCustomerNotes());
        order.setItems(new ArrayList<>());
        
        BigDecimal subtotal = BigDecimal.ZERO;
        
        // Process items
        for (var itemRequest : request.getItems()) {
            ShopMedicine shopMedicine = shopMedicineRepository.findById(itemRequest.getShopMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shop Medicine", "id", 
                            itemRequest.getShopMedicineId()));
            
            // Validate all items from same shop
            if (!shopMedicine.getShop().getId().equals(shop.getId())) {
                throw new BadRequestException("All items must be from the same shop");
            }
            
            // Check stock
            if (shopMedicine.getStockQuantity() < itemRequest.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + shopMedicine.getMedicine().getBrandName());
            }
            
            // Calculate price
            BigDecimal unitPrice = shopMedicine.getDiscountPrice() != null ? 
                    shopMedicine.getDiscountPrice() : shopMedicine.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            
            // Create order item with snapshot of medicine details
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setShopMedicine(shopMedicine);
            orderItem.setMedicineName(shopMedicine.getMedicine().getBrandName());
            orderItem.setMedicineStrength(shopMedicine.getMedicine().getStrength());
            orderItem.setMedicineForm(shopMedicine.getMedicine().getForm());
            if (shopMedicine.getMedicine().getManufacturer() != null) {
                orderItem.setManufacturerName(shopMedicine.getMedicine().getManufacturer().getName());
            }
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setLineTotal(lineTotal);
            order.getItems().add(orderItem);
            
            subtotal = subtotal.add(lineTotal);
            
            // Update stock
            shopMedicine.setStockQuantity(shopMedicine.getStockQuantity() - itemRequest.getQuantity());
            shopMedicineRepository.save(shopMedicine);
        }
        
        // Set order totals
        order.setSubtotal(subtotal);
        order.setTotal(subtotal);
        
        order = orderRepository.save(order);
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(subtotal);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("ONLINE");
        paymentRepository.save(payment);
        
        // Send notification to shop owner
        notificationService.sendOrderStatusUpdate(shop.getOwner().getId(), 
                order.getOrderNumber(), order.getStatus().name());
        
        return mapToResponse(order);
    }
    
    @Transactional
    public OrderResponse placeOrderFromCart(OrderRequest request) {
        User user = currentUser.getUser();
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        
        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        
        // Get shop from first cart item
        MedicineShop shop = cart.getItems().get(0).getShopMedicine().getShop();
        
        // Create order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setShop(shop);
        order.setStatus(OrderStatus.PENDING);
        order.setShippingName(request.getShippingName());
        order.setShippingPhone(request.getShippingPhone());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingCity(request.getShippingCity());
        order.setShippingArea(request.getShippingArea());
        order.setShippingPostalCode(request.getShippingPostalCode());
        order.setCustomerNotes(request.getCustomerNotes());
        order.setItems(new ArrayList<>());
        
        BigDecimal subtotal = BigDecimal.ZERO;
        
        // Process cart items
        for (CartItem cartItem : cart.getItems()) {
            ShopMedicine shopMedicine = cartItem.getShopMedicine();
            
            // Check stock
            if (shopMedicine.getStockQuantity() < cartItem.getQuantity()) {
                throw new BadRequestException("Insufficient stock for " + shopMedicine.getMedicine().getBrandName());
            }
            
            // Calculate price
            BigDecimal unitPrice = shopMedicine.getDiscountPrice() != null ? 
                    shopMedicine.getDiscountPrice() : shopMedicine.getPrice();
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            
            // Create order item with snapshot of medicine details
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setShopMedicine(shopMedicine);
            orderItem.setMedicineName(shopMedicine.getMedicine().getBrandName());
            orderItem.setMedicineStrength(shopMedicine.getMedicine().getStrength());
            orderItem.setMedicineForm(shopMedicine.getMedicine().getForm());
            if (shopMedicine.getMedicine().getManufacturer() != null) {
                orderItem.setManufacturerName(shopMedicine.getMedicine().getManufacturer().getName());
            }
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setLineTotal(lineTotal);
            order.getItems().add(orderItem);
            
            subtotal = subtotal.add(lineTotal);
            
            // Update stock
            shopMedicine.setStockQuantity(shopMedicine.getStockQuantity() - cartItem.getQuantity());
            shopMedicineRepository.save(shopMedicine);
        }
        
        // Set order totals
        order.setSubtotal(subtotal);
        order.setTotal(subtotal);
        
        order = orderRepository.save(order);
        
        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(subtotal);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("ONLINE");
        paymentRepository.save(payment);
        
        // Clear cart
        cart.getItems().clear();
        cart.recalculateTotals();
        cartRepository.save(cart);
        
        // Send notification to shop owner
        notificationService.sendOrderStatusUpdate(shop.getOwner().getId(), 
                order.getOrderNumber(), order.getStatus().name());
        
        return mapToResponse(order);
    }
    
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        
        User user = currentUser.getUser();
        if (!order.getUser().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to cancel this order");
        }
        
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot cancel order in " + order.getStatus() + " status");
        }
        
        // Restore stock
        for (OrderItem item : order.getItems()) {
            ShopMedicine shopMedicine = item.getShopMedicine();
            shopMedicine.setStockQuantity(shopMedicine.getStockQuantity() + item.getQuantity());
            shopMedicineRepository.save(shopMedicine);
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);
        
        // Update payment status
        paymentRepository.findByOrderId(order.getId()).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);
        });
        
        // Notify shop owner
        notificationService.sendOrderStatusUpdate(order.getShop().getOwner().getId(), 
                order.getOrderNumber(), order.getStatus().name());
        
        return mapToResponse(order);
    }
    
    @Transactional
    public OrderResponse updateOrderStatus(Long id, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        
        User user = currentUser.getUser();
        if (!order.getShop().getOwner().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to update this order");
        }
        
        order.setStatus(request.getStatus());
        
        switch (request.getStatus()) {
            case CONFIRMED -> order.setConfirmedAt(LocalDateTime.now());
            case PROCESSING -> order.setProcessingAt(LocalDateTime.now());
            case SHIPPED -> order.setShippedAt(LocalDateTime.now());
            case DELIVERED -> order.setDeliveredAt(LocalDateTime.now());
            default -> {}
        }
        
        order = orderRepository.save(order);
        
        // Notify customer
        notificationService.sendOrderStatusUpdate(order.getUser().getId(), 
                order.getOrderNumber(), order.getStatus().name());
        
        return mapToResponse(order);
    }
    
    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    private PageResponse<OrderResponse> mapToPageResponse(Page<Order> page) {
        List<OrderResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<OrderResponse>builder()
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
    
    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
        
        return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .userEmail(order.getUser().getEmail())
                .shopId(order.getShop().getId())
                .shopName(order.getShop().getName())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .shippingCost(order.getShippingCost())
                .discount(order.getDiscount())
                .total(order.getTotal())
                .shippingName(order.getShippingName())
                .shippingPhone(order.getShippingPhone())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingArea(order.getShippingArea())
                .shippingPostalCode(order.getShippingPostalCode())
                .customerNotes(order.getCustomerNotes())
                .items(items)
                .confirmedAt(order.getConfirmedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
    
    private OrderItemResponse mapItemToResponse(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .shopMedicineId(item.getShopMedicine().getId())
                .medicineName(item.getMedicineName())
                .medicineStrength(item.getMedicineStrength())
                .medicineForm(item.getMedicineForm())
                .manufacturerName(item.getManufacturerName())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .lineTotal(item.getLineTotal())
                .build();
    }
}
