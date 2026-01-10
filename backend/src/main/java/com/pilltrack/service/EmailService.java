package com.pilltrack.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.name:PillTrack}")
    private String appName;
    
    @Async
    public void sendMedicationReminder(String to, String userName, String medicationName, 
                                        String dosage, LocalTime reminderTime) {
        String subject = "⏰ Medication Reminder - " + medicationName;
        String content = buildMedicationReminderContent(userName, medicationName, dosage, reminderTime);
        sendHtmlEmail(to, subject, content);
    }
    
    @Async
    public void sendLowStockAlert(String to, String userName, String medicationName, int currentQuantity) {
        String subject = "⚠️ Low Stock Alert - " + medicationName;
        String content = buildLowStockAlertContent(userName, medicationName, currentQuantity);
        sendHtmlEmail(to, subject, content);
    }
    
    @Async
    public void sendOrderConfirmation(String to, String userName, String orderNumber, String totalAmount) {
        String subject = "✅ Order Confirmed - " + orderNumber;
        String content = buildOrderConfirmationContent(userName, orderNumber, totalAmount);
        sendHtmlEmail(to, subject, content);
    }
    
    @Async
    public void sendOrderStatusUpdate(String to, String userName, String orderNumber, String status) {
        String subject = "📦 Order Update - " + orderNumber;
        String content = buildOrderStatusContent(userName, orderNumber, status);
        sendHtmlEmail(to, subject, content);
    }
    
    @Async
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to " + appName + "! 🎉";
        String content = buildWelcomeContent(userName);
        sendHtmlEmail(to, subject, content);
    }
    
    @Async
    public void sendPasswordResetEmail(String to, String userName, String resetLink) {
        String subject = "Reset Your Password - " + appName;
        String content = buildPasswordResetContent(userName, resetLink);
        sendHtmlEmail(to, subject, content);
    }
    
    private void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {} - {}", to, e.getMessage());
        }
    }
    
    private String buildMedicationReminderContent(String userName, String medicationName, 
                                                   String dosage, LocalTime reminderTime) {
        String timeStr = reminderTime.format(DateTimeFormatter.ofPattern("hh:mm a"));
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .medication-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⏰ Medication Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>It's time to take your medication!</p>
                        <div class="medication-card">
                            <h2>💊 %s</h2>
                            <p><strong>Dosage:</strong> %s</p>
                            <p><strong>Scheduled Time:</strong> %s</p>
                        </div>
                        <p>Remember to take your medication as prescribed for best results.</p>
                        <a href="#" class="btn">Mark as Taken</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated reminder from PillTrack.</p>
                        <p>© 2024 PillTrack. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, medicationName, dosage, timeStr);
    }
    
    private String buildLowStockAlertContent(String userName, String medicationName, int currentQuantity) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .alert-card { background: #fff3cd; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #ffc107; }
                    .btn { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>⚠️ Low Stock Alert</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>Your medication supply is running low!</p>
                        <div class="alert-card">
                            <h2>💊 %s</h2>
                            <p><strong>Remaining:</strong> %d doses</p>
                            <p>Please refill your medication soon to avoid missing doses.</p>
                        </div>
                        <a href="#" class="btn">Order Refill</a>
                    </div>
                    <div class="footer">
                        <p>This is an automated alert from PillTrack.</p>
                        <p>© 2024 PillTrack. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, medicationName, currentQuantity);
    }
    
    private String buildOrderConfirmationContent(String userName, String orderNumber, String totalAmount) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .order-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .btn { display: inline-block; background: #11998e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Order Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>Thank you for your order! Your order has been confirmed.</p>
                        <div class="order-card">
                            <h2>📦 Order #%s</h2>
                            <p><strong>Total Amount:</strong> ৳%s</p>
                            <p>We'll notify you when your order is shipped.</p>
                        </div>
                        <a href="#" class="btn">Track Order</a>
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing PillTrack!</p>
                        <p>© 2024 PillTrack. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, orderNumber, totalAmount);
    }
    
    private String buildOrderStatusContent(String userName, String orderNumber, String status) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .status-card { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
                    .status { font-size: 24px; font-weight: bold; color: #667eea; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📦 Order Update</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>Your order status has been updated!</p>
                        <div class="status-card">
                            <p>Order #%s</p>
                            <p class="status">%s</p>
                        </div>
                        <a href="#" class="btn">View Order Details</a>
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing PillTrack!</p>
                        <p>© 2024 PillTrack. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, orderNumber, status);
    }
    
    private String buildWelcomeContent(String userName) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .feature { display: flex; align-items: center; margin: 15px 0; }
                    .feature-icon { font-size: 24px; margin-right: 15px; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to PillTrack!</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>Welcome to PillTrack - Your Personal Medication Management System!</p>
                        <p>Here's what you can do:</p>
                        <div class="feature">
                            <span class="feature-icon">💊</span>
                            <span>Track your medications and set reminders</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📊</span>
                            <span>Monitor your medication adherence</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">🛒</span>
                            <span>Order medicines from verified pharmacies</span>
                        </div>
                        <div class="feature">
                            <span class="feature-icon">📚</span>
                            <span>Access MedBase - comprehensive medicine information</span>
                        </div>
                        <a href="#" class="btn">Get Started</a>
                    </div>
                    <div class="footer">
                        <p>© 2024 PillTrack. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName);
    }
    
    private String buildPasswordResetContent(String userName, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    .warning { color: #856404; background: #fff3cd; padding: 15px; border-radius: 5px; margin-top: 20px; }
                    .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset</h1>
                    </div>
                    <div class="content">
                        <p>Hi %s,</p>
                        <p>We received a request to reset your password. Click the button below to create a new password:</p>
                        <a href="%s" class="btn">Reset Password</a>
                        <div class="warning">
                            <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
                        </div>
                    </div>
                    <div class="footer">
                        <p>© 2024 PillTrack. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(userName, resetLink);
    }
}
