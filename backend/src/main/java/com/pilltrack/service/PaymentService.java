package com.pilltrack.service;

import com.pilltrack.dto.response.PaymentResponse;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.PaymentException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Order;
import com.pilltrack.model.entity.Payment;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.OrderStatus;
import com.pilltrack.model.enums.PaymentStatus;
import com.pilltrack.repository.OrderRepository;
import com.pilltrack.repository.PaymentRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;
    
    @Value("${sslcommerz.store-id:test}")
    private String storeId;
    
    @Value("${sslcommerz.store-password:test}")
    private String storePassword;
    
    @Value("${sslcommerz.api-url:https://sandbox.sslcommerz.com}")
    private String apiUrl;
    
    @Value("${sslcommerz.success-url:http://localhost:5173/payment/success}")
    private String successUrl;
    
    @Value("${sslcommerz.fail-url:http://localhost:5173/payment/fail}")
    private String failUrl;
    
    @Value("${sslcommerz.cancel-url:http://localhost:5173/payment/cancel}")
    private String cancelUrl;
    
    @Value("${sslcommerz.ipn-url:http://localhost:8080/api/v1/payments/ipn}")
    private String ipnUrl;
    
    public Map<String, Object> initiatePayment(Long orderId) {
        User user = currentUser.getUser();
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("You can only pay for your own orders");
        }
        
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "order", orderId));
        
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment already completed");
        }
        
        // Generate transaction ID
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        payment.setTransactionId(transactionId);
        paymentRepository.save(payment);
        
        // Prepare SSLCommerz request
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("store_id", storeId);
        params.add("store_passwd", storePassword);
        params.add("total_amount", order.getTotal().toString());
        params.add("currency", "BDT");
        params.add("tran_id", transactionId);
        params.add("success_url", successUrl);
        params.add("fail_url", failUrl);
        params.add("cancel_url", cancelUrl);
        params.add("ipn_url", ipnUrl);
        
        // Customer info
        params.add("cus_name", user.getName());
        params.add("cus_email", user.getEmail());
        params.add("cus_phone", order.getShippingPhone() != null ? order.getShippingPhone() : "01700000000");
        params.add("cus_add1", order.getShippingAddress());
        params.add("cus_city", order.getShippingCity());
        params.add("cus_postcode", order.getShippingPostalCode() != null ? order.getShippingPostalCode() : "1000");
        params.add("cus_country", "Bangladesh");
        
        // Shipping info
        params.add("shipping_method", "Courier");
        params.add("ship_name", order.getShippingName());
        params.add("ship_add1", order.getShippingAddress());
        params.add("ship_city", order.getShippingCity());
        params.add("ship_postcode", order.getShippingPostalCode() != null ? order.getShippingPostalCode() : "1000");
        params.add("ship_country", "Bangladesh");
        
        // Product info
        params.add("product_name", "Medicine Order #" + order.getOrderNumber());
        params.add("product_category", "Medicine");
        params.add("product_profile", "physical-goods");
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    apiUrl + "/gwprocess/v4/api.php",
                    request,
                    Map.class
            );
            
            if (response != null && "SUCCESS".equals(response.get("status"))) {
                Map<String, Object> result = new HashMap<>();
                result.put("gatewayUrl", response.get("GatewayPageURL"));
                result.put("transactionId", transactionId);
                result.put("sessionKey", response.get("sessionkey"));
                return result;
            } else {
                String error = response != null ? (String) response.get("failedreason") : "Unknown error";
                throw new PaymentException("Payment initiation failed: " + error);
            }
        } catch (Exception e) {
            log.error("Payment initiation error: ", e);
            throw new PaymentException("Payment initiation failed: " + e.getMessage());
        }
    }
    
    @Transactional
    public void handlePaymentSuccess(Map<String, String> params) {
        String transactionId = params.get("tran_id");
        String valId = params.get("val_id");
        String bankTransactionId = params.get("bank_tran_id");
        
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionId", transactionId));
        
        // Validate payment
        if (validatePayment(valId)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setValidationId(valId);
            payment.setBankTransactionId(bankTransactionId);
            payment.setPaymentMethod(params.get("card_type"));
            payment.setPaidAt(LocalDateTime.now());
            paymentRepository.save(payment);
            
            // Update order status
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.CONFIRMED);
            order.setConfirmedAt(LocalDateTime.now());
            orderRepository.save(order);
            
            // Notify user
            notificationService.sendOrderStatusUpdate(order.getUser().getId(), order.getOrderNumber(), "CONFIRMED");
            
            log.info("Payment successful for transaction: {}", transactionId);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            
            log.error("Payment validation failed for transaction: {}", transactionId);
        }
    }
    
    @Transactional
    public void handlePaymentFailure(Map<String, String> params) {
        String transactionId = params.get("tran_id");
        
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionId", transactionId));
        
        payment.setStatus(PaymentStatus.FAILED);
        paymentRepository.save(payment);
        
        log.error("Payment failed for transaction: {}", transactionId);
    }
    
    @Transactional
    public void handlePaymentCancel(Map<String, String> params) {
        String transactionId = params.get("tran_id");
        
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionId", transactionId));
        
        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);
        
        log.info("Payment cancelled for transaction: {}", transactionId);
    }
    
    @Transactional
    public void handleIpn(Map<String, String> params) {
        String transactionId = params.get("tran_id");
        String status = params.get("status");
        
        log.info("IPN received for transaction: {} with status: {}", transactionId, status);
        
        if ("VALID".equals(status)) {
            handlePaymentSuccess(params);
        } else if ("FAILED".equals(status)) {
            handlePaymentFailure(params);
        }
    }
    
    public PaymentResponse getPaymentByOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", orderId));
        
        User user = currentUser.getUser();
        if (!order.getUser().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new BadRequestException("You don't have permission to view this payment");
        }
        
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "order", orderId));
        
        return mapToResponse(payment);
    }
    
    public PaymentResponse verifyPayment(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "transactionId", transactionId));
        
        return mapToResponse(payment);
    }
    
    private boolean validatePayment(String valId) {
        if (valId == null || valId.isEmpty()) {
            return false;
        }
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            String validationUrl = String.format(
                    "%s/validator/api/validationserverAPI.php?val_id=%s&store_id=%s&store_passwd=%s&format=json",
                    apiUrl, valId, storeId, storePassword
            );
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(validationUrl, Map.class);
            
            return response != null && "VALID".equals(response.get("status"));
        } catch (Exception e) {
            log.error("Payment validation error: ", e);
            return false;
        }
    }
    
    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .paymentMethod(payment.getPaymentMethod())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
