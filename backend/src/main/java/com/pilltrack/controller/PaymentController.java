package com.pilltrack.controller;

import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.PaymentResponse;
import com.pilltrack.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management endpoints")
public class PaymentController {
    
    private final PaymentService paymentService;
    
    @PostMapping("/initiate/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Initiate payment for an order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> initiatePayment(@PathVariable Long orderId) {
        Map<String, Object> response = paymentService.initiatePayment(orderId);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment initiated"));
    }
    
    @PostMapping("/success")
    @Operation(summary = "Payment success callback from SSLCommerz")
    public ResponseEntity<String> paymentSuccess(@RequestParam Map<String, String> params) {
        paymentService.handlePaymentSuccess(params);
        // Redirect to frontend success page
        return ResponseEntity.ok("Payment successful! Redirecting...");
    }
    
    @PostMapping("/fail")
    @Operation(summary = "Payment failure callback from SSLCommerz")
    public ResponseEntity<String> paymentFail(@RequestParam Map<String, String> params) {
        paymentService.handlePaymentFailure(params);
        // Redirect to frontend failure page
        return ResponseEntity.ok("Payment failed! Redirecting...");
    }
    
    @PostMapping("/cancel")
    @Operation(summary = "Payment cancel callback from SSLCommerz")
    public ResponseEntity<String> paymentCancel(@RequestParam Map<String, String> params) {
        paymentService.handlePaymentCancel(params);
        // Redirect to frontend cancel page
        return ResponseEntity.ok("Payment cancelled! Redirecting...");
    }
    
    @PostMapping("/ipn")
    @Operation(summary = "IPN (Instant Payment Notification) callback from SSLCommerz")
    public ResponseEntity<String> ipn(@RequestParam Map<String, String> params) {
        paymentService.handleIpn(params);
        return ResponseEntity.ok("IPN received");
    }
    
    @GetMapping("/order/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get payment details for an order")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentByOrder(@PathVariable Long orderId) {
        PaymentResponse response = paymentService.getPaymentByOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/verify/{transactionId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Verify payment transaction")
    public ResponseEntity<ApiResponse<PaymentResponse>> verifyPayment(@PathVariable String transactionId) {
        PaymentResponse response = paymentService.verifyPayment(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
