# 💊 PillTrack - Medication Management & Pharmacy Marketplace

<div align="center">

![PillTrack Logo](public/pill-logo.svg)

**A comprehensive full-stack medication management system with intelligent reminders, online pharmacy marketplace, doctor directory, and pharmacy finder.**

[![Java](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=java)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Authentication](#-authentication)
- [Class Diagrams](#-class-diagrams)
- [Configuration](#-configuration)
- [Data Sources](#-data-sources)

---

## 🎯 Overview

**PillTrack** is a comprehensive healthcare application designed to help users manage their medications effectively while providing access to a verified pharmacy marketplace. The platform combines:

- **Medication Tracking**: Add medications, set reminders, track doses, and monitor adherence
- **Online Pharmacy**: Browse verified pharmacies, order medicines, upload prescriptions
- **Doctor Directory**: Find doctors by specialty, location, and ratings
- **Pharmacy Finder**: Locate nearby pharmacies with specific medicines using geolocation

---

## ✨ Features

### 🏠 For Users

| Feature | Description |
|---------|-------------|
| **Medication Management** | Add, edit, and delete personal medications with dosage details |
| **Smart Reminders** | Browser notifications with sound alerts for dose times |
| **Dose Tracking** | Mark doses as taken/skipped/missed with timestamps |
| **Adherence Analytics** | Track medication adherence percentage with charts |
| **Calendar View** | FullCalendar integration for visual dose scheduling |
| **Low Stock Alerts** | Notifications when medication inventory runs low |
| **Profile Management** | Store health info, allergies, emergency contacts |

### 🛒 Marketplace

| Feature | Description |
|---------|-------------|
| **Medicine Search** | Search 21,000+ medicines by name, generic, manufacturer |
| **Shop Listings** | Browse verified pharmacy shops |
| **Cart & Checkout** | Add to cart, manage quantities, checkout flow |
| **Prescription Upload** | Upload prescriptions for restricted medicines |
| **Order Tracking** | Track order status from placement to delivery |
| **Alternative Medicines** | Find cheaper alternatives with same generic composition |

### 🏥 Healthcare Directory

| Feature | Description |
|---------|-------------|
| **Doctor Finder** | Search 7,200+ doctors by specialty and location |
| **Pharmacy Locator** | Find nearby pharmacies using GPS/map |
| **Medicine Availability** | Check which pharmacies have specific medicines in stock |
| **Interactive Maps** | Leaflet/OpenStreetMap integration |

### 🏪 For Shop Owners

| Feature | Description |
|---------|-------------|
| **Shop Registration** | Register pharmacy with license verification |
| **Inventory Management** | Add medicines, set prices, manage stock |
| **Order Processing** | View and process customer orders |
| **Sales Dashboard** | Track sales and order statistics |

### 👨‍💼 For Administrators

| Feature | Description |
|---------|-------------|
| **User Management** | Activate/deactivate user accounts |
| **Shop Verification** | Approve/reject pharmacy registrations |
| **Order Oversight** | Monitor all platform orders |
| **Dashboard Analytics** | Platform-wide statistics |

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Java** | 17 | Programming Language |
| **Spring Boot** | 3.2.5 | Application Framework |
| **Spring Security** | 6.x | Authentication & Authorization |
| **Spring Data JPA** | 3.x | Database ORM |
| **PostgreSQL** | 16 | Relational Database |
| **JWT (jjwt)** | 0.12.5 | Token-based Authentication |
| **Quartz Scheduler** | 2.3.2 | Job Scheduling for Reminders |
| **SpringDoc OpenAPI** | 2.5.0 | API Documentation (Swagger) |
| **Lombok** | 1.18.x | Boilerplate Code Reduction |
| **Thymeleaf** | 3.x | Email Templates |
| **Maven** | 3.9.x | Build Tool |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Library |
| **Vite** | 7.2.4 | Build Tool & Dev Server |
| **React Router DOM** | 7.12.0 | Client-side Routing |
| **Axios** | 1.13.2 | HTTP Client |
| **TailwindCSS** | 3.4.17 | Utility-first CSS |
| **Framer Motion** | 12.25.0 | Animations |
| **Recharts** | 3.6.0 | Data Visualization |
| **FullCalendar** | 6.1.20 | Calendar Component |
| **React Leaflet** | 5.0.0 | Interactive Maps |
| **Lucide React** | 0.562.0 | Icon Library |
| **date-fns** | 5.x | Date Utilities |

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                            │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend (Vite)                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │ │
│  │  │  Pages   │  │Components│  │ Context  │  │    Services      │ │ │
│  │  └──────────┘  └──────────┘  └──────────┘  │    (API calls)   │ │ │
│  │                                            └──────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST (JSON)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                             │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     Security Layer                               │ │
│  │         JWT Authentication │ CORS │ Role-based Access           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    Controller Layer                              │ │
│  │   Auth │ User │ Medication │ Order │ Shop │ Medicine │ ...      │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                     Service Layer                                │ │
│  │            Business Logic │ Validation │ Processing             │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                   Repository Layer                               │ │
│  │                 Spring Data JPA Repositories                     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                    │                                 │
│  ┌──────────────┐  ┌──────────────────────────────────────────────┐ │
│  │Quartz Scheduler│ │           Entity Models                     │ │
│  │  (Reminders)   │ │   User │ Medication │ Order │ Medicine │... │ │
│  └──────────────┘  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                              │
│            (Hosted on Aiven Cloud or Local)                         │
└─────────────────────────────────────────────────────────────────────┘
```

### Request Flow

```
User Action → React Component → Context/Service → Axios API Call
                                                        │
                                                        ▼
JWT Token attached → Controller → Service → Repository → Database
                          │            │
                          ▼            ▼
                      DTO Mapping   Business Logic
                          │
                          ▼
                   Response DTO → JSON → Frontend State Update → UI Render
```

---

## 🚀 Getting Started

### Prerequisites

- **Java 17+** (JDK)
- **Node.js 18+** and npm
- **PostgreSQL 15+** (or use cloud instance)
- **Maven 3.9+** (or use included wrapper)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pilltrack.git
   cd pilltrack/PillTrack
   ```

2. **Configure Backend**
   
   Edit `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://your-host:5432/pilltrack
       username: your-username
       password: your-password
   
   app:
     jwt:
       secret: your-256-bit-secret-key
   ```

3. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

4. **Start the Application**
   
   **Option A: Using the startup script (Windows)**
   ```powershell
   .\start.ps1
   ```
   
   **Option B: Manual startup**
   
   Terminal 1 - Backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   
   Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8080/api/v1
   - Swagger UI: http://localhost:8080/api/swagger-ui.html

---

## 📁 Project Structure

```
PillTrack/
├── 📁 backend/                          # Spring Boot Backend
│   ├── 📁 src/main/java/com/pilltrack/
│   │   ├── 📄 PillTrackApplication.java # Main Application Entry
│   │   │
│   │   ├── 📁 config/                   # Configuration Classes
│   │   │   ├── SecurityConfig.java      # Spring Security configuration
│   │   │   ├── CorsConfig.java          # CORS settings
│   │   │   ├── QuartzConfig.java        # Scheduler configuration
│   │   │   └── OpenAPIConfig.java       # Swagger configuration
│   │   │
│   │   ├── 📁 controller/               # REST API Controllers
│   │   │   ├── AuthController.java      # Authentication endpoints
│   │   │   ├── UserController.java      # User management
│   │   │   ├── MedicationController.java# Medication CRUD
│   │   │   ├── DoseLogController.java   # Dose tracking
│   │   │   ├── MedicineController.java  # Medicine database
│   │   │   ├── MedicineShopController.java # Shop management
│   │   │   ├── ShopMedicineController.java # Shop inventory
│   │   │   ├── CartController.java      # Shopping cart
│   │   │   ├── OrderController.java     # Order processing
│   │   │   ├── PaymentController.java   # Payment handling
│   │   │   ├── NotificationController.java # Notifications
│   │   │   ├── DoctorController.java    # Doctor directory
│   │   │   ├── PharmacyFinderController.java # Pharmacy locator
│   │   │   ├── CategoryController.java  # Medicine categories
│   │   │   ├── ManufacturerController.java # Manufacturers
│   │   │   ├── PrescriptionController.java # Prescriptions
│   │   │   └── AdminController.java     # Admin operations
│   │   │
│   │   ├── 📁 dto/                      # Data Transfer Objects
│   │   │   ├── 📁 request/              # Request DTOs
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── RegisterRequest.java
│   │   │   │   ├── MedicationRequest.java
│   │   │   │   ├── OrderRequest.java
│   │   │   │   └── ...
│   │   │   └── 📁 response/             # Response DTOs
│   │   │       ├── AuthResponse.java
│   │   │       ├── UserResponse.java
│   │   │       ├── MedicationResponse.java
│   │   │       └── ...
│   │   │
│   │   ├── 📁 model/                    # Domain Models
│   │   │   ├── 📁 entity/               # JPA Entities
│   │   │   │   ├── User.java
│   │   │   │   ├── Role.java
│   │   │   │   ├── Medication.java
│   │   │   │   ├── DoseLog.java
│   │   │   │   ├── DoseSchedule.java
│   │   │   │   ├── Medicine.java
│   │   │   │   ├── MedicineManufacturer.java
│   │   │   │   ├── MedicineCategory.java
│   │   │   │   ├── MedicineShop.java
│   │   │   │   ├── ShopMedicine.java
│   │   │   │   ├── Cart.java
│   │   │   │   ├── CartItem.java
│   │   │   │   ├── Order.java
│   │   │   │   ├── OrderItem.java
│   │   │   │   ├── Payment.java
│   │   │   │   ├── Prescription.java
│   │   │   │   ├── Doctor.java
│   │   │   │   ├── Specialty.java
│   │   │   │   ├── Notification.java
│   │   │   │   └── RefreshToken.java
│   │   │   │
│   │   │   └── 📁 enums/                # Enumerations
│   │   │       ├── RoleType.java
│   │   │       ├── MedicationType.java
│   │   │       ├── MedicationStatus.java
│   │   │       ├── DoseStatus.java
│   │   │       ├── OrderStatus.java
│   │   │       ├── ShopStatus.java
│   │   │       ├── PaymentStatus.java
│   │   │       └── NotificationType.java
│   │   │
│   │   ├── 📁 repository/               # JPA Repositories
│   │   │   ├── UserRepository.java
│   │   │   ├── MedicationRepository.java
│   │   │   ├── DoseLogRepository.java
│   │   │   ├── MedicineRepository.java
│   │   │   ├── OrderRepository.java
│   │   │   └── ...
│   │   │
│   │   ├── 📁 service/                  # Business Logic Services
│   │   │   ├── AuthService.java
│   │   │   ├── UserService.java
│   │   │   ├── MedicationService.java
│   │   │   ├── DoseLogService.java
│   │   │   ├── MedicineService.java
│   │   │   ├── OrderService.java
│   │   │   ├── CartService.java
│   │   │   ├── NotificationService.java
│   │   │   ├── EmailService.java
│   │   │   └── ...
│   │   │
│   │   ├── 📁 security/                 # Security Components
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── JwtTokenProvider.java
│   │   │   ├── CustomUserDetailsService.java
│   │   │   └── JwtAuthenticationEntryPoint.java
│   │   │
│   │   ├── 📁 job/                      # Scheduled Jobs
│   │   │   ├── ReminderJob.java         # Medication reminders
│   │   │   └── DoseScheduleJob.java     # Daily dose scheduling
│   │   │
│   │   ├── 📁 exception/                # Custom Exceptions
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── ResourceNotFoundException.java
│   │   │   ├── BadRequestException.java
│   │   │   └── UnauthorizedException.java
│   │   │
│   │   └── 📁 util/                     # Utility Classes
│   │       └── SlugGenerator.java
│   │
│   └── 📁 src/main/resources/
│       ├── 📄 application.yml           # Application configuration
│       └── 📁 templates/                # Email templates
│
├── 📁 src/                              # React Frontend
│   ├── 📄 main.jsx                      # Application entry point
│   ├── 📄 App.jsx                       # Root component & routing
│   ├── 📄 App.css                       # Global styles
│   ├── 📄 index.css                     # Tailwind imports
│   │
│   ├── 📁 pages/                        # Page Components
│   │   ├── 📄 Landing.jsx               # Home page
│   │   ├── 📁 Auth/
│   │   │   └── 📄 index.jsx             # Login/Register
│   │   ├── 📁 Dashboard/
│   │   │   ├── 📄 index.jsx             # Dashboard home
│   │   │   ├── 📄 Medications.jsx       # Medication management
│   │   │   ├── 📄 Calendar.jsx          # Calendar view
│   │   │   ├── 📄 Orders.jsx            # Order history
│   │   │   ├── 📄 Profile.jsx           # User profile
│   │   │   └── 📄 Settings.jsx          # User settings
│   │   ├── 📁 Marketplace/
│   │   │   ├── 📄 index.jsx             # Medicine marketplace
│   │   │   └── 📄 MedicineDetail.jsx    # Medicine details
│   │   ├── 📁 Cart/
│   │   │   └── 📄 index.jsx             # Shopping cart
│   │   ├── 📁 MedBase/
│   │   │   └── 📄 index.jsx             # Medicine database
│   │   ├── 📁 PharmacyFinder/
│   │   │   └── 📄 index.jsx             # Pharmacy locator
│   │   ├── 📁 FindDoctor/
│   │   │   └── 📄 index.jsx             # Doctor directory
│   │   └── 📁 Admin/
│   │       ├── 📄 AdminDashboard.jsx    # Admin panel
│   │       └── 📄 ShopDashboard.jsx     # Shop owner panel
│   │
│   ├── 📁 components/                   # Reusable Components
│   │   ├── 📁 common/
│   │   │   ├── 📄 CartSidebar.jsx       # Cart slide-out
│   │   │   ├── 📄 NotificationDropdown.jsx
│   │   │   └── 📄 ReminderAlert.jsx     # Dose reminder popup
│   │   ├── 📁 dashboard/
│   │   │   ├── 📄 Layout.jsx            # Dashboard layout
│   │   │   ├── 📄 Navbar.jsx            # Top navigation
│   │   │   ├── 📄 Sidebar.jsx           # Side navigation
│   │   │   └── 📄 MobileSidebar.jsx     # Mobile navigation
│   │   ├── 📁 medication/
│   │   │   ├── 📄 AddMedicationModal.jsx
│   │   │   ├── 📄 MedicationDetailModal.jsx
│   │   │   └── 📄 TodaysDoseCard.jsx
│   │   └── 📁 ui/                       # Base UI components
│   │       ├── 📄 Button.jsx
│   │       ├── 📄 Card.jsx
│   │       ├── 📄 Input.jsx
│   │       ├── 📄 Label.jsx
│   │       └── 📄 Tabs.jsx
│   │
│   ├── 📁 context/                      # React Context Providers
│   │   ├── 📄 AuthContext.jsx           # Authentication state
│   │   ├── 📄 CartContext.jsx           # Shopping cart state
│   │   ├── 📄 NotificationContext.jsx   # Notifications state
│   │   └── 📄 index.js                  # Context exports
│   │
│   ├── 📁 services/
│   │   └── 📄 api.js                    # Axios API client
│   │
│   ├── 📁 hooks/
│   │   └── 📄 useNotificationSound.js   # Sound notification hook
│   │
│   ├── 📁 utils/
│   │   ├── 📄 cn.js                     # Class name utility
│   │   └── 📄 timezone.js               # Timezone utilities
│   │
│   └── 📁 assets/                       # Static assets
│
├── 📁 med_DB/                           # Database Seed Data
│   ├── 📄 medicine.csv                  # 21,716 medicines
│   ├── 📄 doctors_combined_data.csv     # 7,293 doctors
│   └── 📄 indication.csv                # Medicine indications
│
├── 📁 public/                           # Public static files
│
├── 📄 package.json                      # Frontend dependencies
├── 📄 vite.config.js                    # Vite configuration
├── 📄 tailwind.config.js                # Tailwind configuration
├── 📄 postcss.config.js                 # PostCSS configuration
├── 📄 eslint.config.js                  # ESLint configuration
├── 📄 index.html                        # HTML entry point
└── 📄 start.ps1                         # Windows startup script
```

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│      ROLE       │       │      USER       │       │   REFRESH_TOKEN │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ role_id (FK)    │       │ id (PK)         │
│ name            │       │ id (PK)         │──────►│ user_id (FK)    │
│ description     │       │ name            │       │ token           │
└─────────────────┘       │ email (unique)  │       │ expiry_date     │
                          │ password        │       └─────────────────┘
                          │ phone           │
                          │ address         │       ┌─────────────────┐
                          │ city            │       │     CART        │
                          │ postal_code     │       ├─────────────────┤
                          │ profile_image   │       │ id (PK)         │
                          │ date_of_birth   │◄──────│ user_id (FK)    │
                          │ blood_type      │       │ created_at      │
                          │ allergies       │       │ updated_at      │
                          │ emergency_contact│      └────────┬────────┘
                          │ is_active       │                │
                          │ is_email_verified│               │
                          │ created_at      │       ┌────────▼────────┐
                          │ updated_at      │       │   CART_ITEM     │
                          └────────┬────────┘       ├─────────────────┤
                                   │                │ id (PK)         │
         ┌─────────────────────────┼─────────────────────────────────┐
         │                         │                │ cart_id (FK)    │
         │                         │                │ shop_medicine_id│
         ▼                         ▼                │ quantity        │
┌─────────────────┐       ┌─────────────────┐       │ price           │
│   MEDICATION    │       │  NOTIFICATION   │       └─────────────────┘
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │       ┌─────────────────┐
│ user_id (FK)    │       │ user_id (FK)    │       │  MEDICINE_SHOP  │
│ name            │       │ type            │       ├─────────────────┤
│ type            │       │ title           │       │ id (PK)         │
│ dosage          │       │ message         │       │ owner_id (FK)───┤
│ frequency       │       │ is_read         │       │ name            │
│ inventory       │       │ created_at      │       │ slug (unique)   │
│ quantity_per_dose│      └─────────────────┘       │ email           │
│ reminder_minutes │                                │ phone           │
│ start_date      │                                 │ address         │
│ end_date        │       ┌─────────────────┐       │ city            │
│ instructions    │       │     ORDER       │       │ latitude        │
│ prescribed_by   │       ├─────────────────┤       │ longitude       │
│ status          │       │ id (PK)         │       │ license_number  │
│ created_at      │       │ order_number    │       │ status          │
└────────┬────────┘       │ user_id (FK)────┤       │ is_verified     │
         │                │ shop_id (FK)────┼──────►│ created_at      │
         │                │ status          │       └────────┬────────┘
         ▼                │ subtotal        │                │
┌─────────────────┐       │ discount        │                │
│   DOSE_LOG      │       │ shipping_cost   │       ┌────────▼────────┐
├─────────────────┤       │ tax             │       │  SHOP_MEDICINE  │
│ id (PK)         │       │ total           │       ├─────────────────┤
│ medication_id   │       │ shipping_name   │       │ id (PK)         │
│ status          │       │ shipping_phone  │       │ shop_id (FK)    │
│ scheduled_time  │       │ shipping_address│       │ medicine_id (FK)│
│ taken_time      │       │ prescription_id │       │ price           │
│ notes           │       │ requires_rx     │       │ discount_price  │
│ created_at      │       │ created_at      │       │ stock_quantity  │
└─────────────────┘       └────────┬────────┘       │ batch_number    │
                                   │                │ expiry_date     │
┌─────────────────┐       ┌────────▼────────┐       └────────┬────────┘
│ DOSE_SCHEDULE   │       │   ORDER_ITEM    │                │
├─────────────────┤       ├─────────────────┤                │
│ id (PK)         │       │ id (PK)         │       ┌────────▼────────┐
│ medication_id   │       │ order_id (FK)   │       │    MEDICINE     │
│ time            │       │ shop_medicine_id│       ├─────────────────┤
│ is_active       │       │ quantity        │       │ id (PK)         │
└─────────────────┘       │ price           │       │ brand_id        │
                          │ subtotal        │       │ brand_name      │
                          └─────────────────┘       │ type            │
                                                    │ slug (unique)   │
┌─────────────────┐       ┌─────────────────┐       │ dosage_form     │
│    PAYMENT      │       │  PRESCRIPTION   │       │ generic_name    │
├─────────────────┤       ├─────────────────┤       │ strength        │
│ id (PK)         │       │ id (PK)         │       │ manufacturer_id │
│ order_id (FK)   │       │ user_id (FK)    │       │ unit_quantity   │
│ transaction_id  │       │ order_id (FK)   │       │ container_type  │
│ amount          │       │ image_url       │       │ unit_price      │
│ status          │       │ notes           │       │ pack_quantity   │
│ payment_method  │       │ status          │       │ pack_price      │
│ created_at      │       │ verified_by     │       │ view_count      │
└─────────────────┘       │ verified_at     │       └────────┬────────┘
                          └─────────────────┘                │
                                                    ┌────────▼────────┐
┌─────────────────┐       ┌─────────────────┐       │  MANUFACTURER   │
│     DOCTOR      │       │   SPECIALTY     │       ├─────────────────┤
├─────────────────┤       ├─────────────────┤       │ id (PK)         │
│ id (PK)         │◄──────│ id (PK)         │       │ name            │
│ name            │       │ name            │       │ slug            │
│ education       │       │ slug            │       │ description     │
│ specialty_id    │       │ description     │       │ country         │
│ experience_years│       └─────────────────┘       │ website         │
│ chamber         │                                 └─────────────────┘
│ location        │       ┌─────────────────┐
│ concentrations  │       │    CATEGORY     │
│ consultation_fee│       ├─────────────────┤
│ rating          │       │ id (PK)         │
└─────────────────┘       │ name            │
                          │ slug            │
                          │ description     │
                          │ image_url       │
                          └─────────────────┘
```

### Entity Details

#### User Entity
```java
@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(nullable = false)
    private String password;  // BCrypt hashed
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
    
    private String phone;
    private String address;
    private String city;
    private String postalCode;
    private String profileImageUrl;
    private LocalDate dateOfBirth;
    private String bloodType;
    private String allergies;
    private String emergencyContact;
    private Boolean isActive = true;
    private Boolean isEmailVerified = false;
    
    // Relationships
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Medication> medications;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;
    
    @OneToOne(mappedBy = "owner")
    private MedicineShop shop;  // If SHOP_OWNER
}
```

#### Medication Entity
```java
@Entity
@Table(name = "medications")
public class Medication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Enumerated(EnumType.STRING)
    private MedicationType type;  // TABLET, CAPSULE, SYRUP, etc.
    
    private String dosage;        // e.g., "500mg"
    private Integer frequency;    // doses per day
    private Integer inventory;    // current stock count
    private Integer quantityPerDose;
    private Integer reminderMinutesBefore;
    private LocalDate startDate;
    private LocalDate endDate;
    private String instructions;
    private String prescribedBy;
    
    @Enumerated(EnumType.STRING)
    private MedicationStatus status;  // ACTIVE, COMPLETED, PAUSED
    
    // Relationships
    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL)
    private List<DoseLog> doseLogs;
    
    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL)
    private List<DoseSchedule> doseSchedules;
}
```

#### Order Entity
```java
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, length = 50)
    private String orderNumber;  // Auto-generated: ORD-YYYYMMDD-XXXXX
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private MedicineShop shop;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;  // PENDING, CONFIRMED, SHIPPED, DELIVERED
    
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal shippingCost;
    private BigDecimal tax;
    private BigDecimal total;
    
    // Shipping details
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingCity;
    
    private Boolean requiresPrescription;
    
    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;
    
    @OneToOne
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;
}
```

### Enumerations

| Enum | Values | Usage |
|------|--------|-------|
| **RoleType** | `ADMIN`, `USER`, `SHOP_OWNER` | User roles |
| **MedicationType** | `TABLET`, `CAPSULE`, `SYRUP`, `INJECTION`, `DROPS`, `OINTMENT`, `INHALER`, `PATCH` | Medication form |
| **MedicationStatus** | `ACTIVE`, `COMPLETED`, `DISCONTINUED`, `PAUSED` | Medication state |
| **DoseStatus** | `TAKEN`, `MISSED`, `SKIPPED`, `PENDING` | Dose tracking |
| **OrderStatus** | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REJECTED`, `REFUNDED` | Order workflow |
| **ShopStatus** | `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED`, `INACTIVE` | Shop verification |
| **PaymentStatus** | `PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`, `REFUNDED` | Payment state |
| **NotificationType** | `MEDICATION_REMINDER`, `DOSE_LOGGED`, `LOW_STOCK`, `ORDER_PLACED`, `ORDER_CONFIRMED`, `ORDER_SHIPPED`, `ORDER_DELIVERED`, `PAYMENT_SUCCESS`, `SHOP_VERIFIED`, `NEW_ORDER`, `SYSTEM_ALERT` | Notification types |

---

## 📡 API Reference

### Base URL
```
http://localhost:8080/api/v1
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

---

### 🔐 Authentication API

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+880123456789",
  "role": "USER"  // or "SHOP_OWNER"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900000,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+880123456789",
    "role": "USER",
    "isActive": true,
    "isEmailVerified": false
  },
  "roles": ["ROLE_USER"]
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

---

### 👤 User API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/users/me` | Get current user profile | ✅ |
| `PUT` | `/users/me` | Update profile | ✅ |
| `POST` | `/users/change-password` | Change password | ✅ |
| `GET` | `/users/{id}` | Get user by ID | ✅ Admin |
| `GET` | `/users/` | List all users (paginated) | ✅ Admin |
| `GET` | `/users/role/{role}` | Get users by role | ✅ Admin |
| `GET` | `/users/search` | Search users | ✅ Admin |
| `POST` | `/users/{id}/activate` | Activate user | ✅ Admin |
| `POST` | `/users/{id}/deactivate` | Deactivate user | ✅ Admin |

#### Update Profile
```http
PUT /users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+880123456789",
  "address": "123 Main Street",
  "city": "Dhaka",
  "postalCode": "1200",
  "dateOfBirth": "1990-01-15",
  "bloodType": "O+",
  "allergies": "Penicillin, Sulfa drugs",
  "emergencyContact": "Jane Doe: +880987654321"
}
```

---

### 💊 Medication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/medications/` | Get all user medications |
| `GET` | `/medications/paged` | Get paginated medications |
| `GET` | `/medications/{id}` | Get medication by ID |
| `GET` | `/medications/low-stock` | Get low stock medications |
| `POST` | `/medications/` | Create medication |
| `PUT` | `/medications/{id}` | Update medication |
| `DELETE` | `/medications/{id}` | Delete medication |
| `PATCH` | `/medications/{id}/status` | Update status |
| `PATCH` | `/medications/{id}/inventory` | Update inventory |

#### Create Medication
```http
POST /medications/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Metformin",
  "type": "TABLET",
  "dosage": "500mg",
  "frequency": 2,
  "inventory": 60,
  "quantityPerDose": 1,
  "reminderMinutesBefore": 15,
  "startDate": "2026-01-18",
  "endDate": "2026-03-18",
  "instructions": "Take with meals",
  "prescribedBy": "Dr. Smith",
  "doseTimes": ["08:00", "20:00"]
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Metformin",
  "type": "TABLET",
  "dosage": "500mg",
  "frequency": 2,
  "inventory": 60,
  "quantityPerDose": 1,
  "reminderMinutesBefore": 15,
  "startDate": "2026-01-18",
  "endDate": "2026-03-18",
  "instructions": "Take with meals",
  "prescribedBy": "Dr. Smith",
  "status": "ACTIVE",
  "doseSchedules": [
    {"id": 1, "time": "08:00:00", "isActive": true},
    {"id": 2, "time": "20:00:00", "isActive": true}
  ],
  "createdAt": "2026-01-18T10:30:00"
}
```

---

### 📋 Dose Log API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dose-logs/today` | Get today's doses |
| `GET` | `/dose-logs/range` | Get doses by date range |
| `GET` | `/dose-logs/medication/{id}` | Get doses for medication |
| `POST` | `/dose-logs/` | Log a dose |
| `POST` | `/dose-logs/{id}/taken` | Mark dose as taken |
| `POST` | `/dose-logs/{id}/skipped` | Mark dose as skipped |
| `POST` | `/dose-logs/{id}/missed` | Mark dose as missed |
| `GET` | `/dose-logs/adherence` | Get adherence percentage |

#### Get Today's Doses
```http
GET /dose-logs/today?timezone=Asia/Dhaka
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "medicationId": 1,
    "medicationName": "Metformin",
    "scheduledTime": "2026-01-18T08:00:00",
    "status": "TAKEN",
    "takenTime": "2026-01-18T08:05:00",
    "notes": null
  },
  {
    "id": 2,
    "medicationId": 1,
    "medicationName": "Metformin",
    "scheduledTime": "2026-01-18T20:00:00",
    "status": "PENDING",
    "takenTime": null,
    "notes": null
  }
]
```

#### Mark Dose as Taken
```http
POST /dose-logs/1/taken
Authorization: Bearer <token>
Content-Type: application/json

{
  "takenTime": "2026-01-18T08:05:00",
  "notes": "Took with breakfast"
}
```

---

### 💉 Medicine API (MedBase)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/medicines/` | List all medicines (paginated) | ❌ |
| `GET` | `/medicines/{id}` | Get medicine by ID | ❌ |
| `GET` | `/medicines/slug/{slug}` | Get medicine by slug | ❌ |
| `GET` | `/medicines/search` | Search medicines | ❌ |
| `GET` | `/medicines/type/{type}` | Filter by type | ❌ |
| `GET` | `/medicines/manufacturer/{id}` | Filter by manufacturer | ❌ |
| `GET` | `/medicines/generic/{name}` | Filter by generic name | ❌ |
| `GET` | `/medicines/dosage-form/{form}` | Filter by dosage form | ❌ |
| `GET` | `/medicines/{id}/alternatives` | Get alternatives | ❌ |
| `GET` | `/medicines/popular` | Get popular medicines | ❌ |
| `GET` | `/medicines/types` | Get all medicine types | ❌ |
| `GET` | `/medicines/dosage-forms` | Get all dosage forms | ❌ |
| `GET` | `/medicines/generic-names` | Get all generic names | ❌ |

#### Search Medicines
```http
GET /medicines/search?q=paracetamol&page=0&size=20
```

**Response:**
```json
{
  "content": [
    {
      "id": 1,
      "brandName": "Napa",
      "genericName": "Paracetamol",
      "dosageForm": "Tablet",
      "strength": "500mg",
      "manufacturer": {
        "id": 1,
        "name": "Beximco Pharmaceuticals Ltd."
      },
      "unitPrice": 2.50,
      "packPrice": 50.00,
      "packQuantity": 20,
      "type": "allopathic",
      "slug": "napa-500mg"
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

---

### 🏪 Medicine Shop API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/shops/` | Get all active shops | ❌ |
| `GET` | `/shops/{id}` | Get shop by ID | ❌ |
| `GET` | `/shops/slug/{slug}` | Get shop by slug | ❌ |
| `GET` | `/shops/search` | Search shops | ❌ |
| `GET` | `/shops/verified` | Get verified shops | ❌ |
| `GET` | `/shops/my-shop` | Get owner's shop | ✅ SHOP_OWNER |
| `POST` | `/shops/` | Create shop | ✅ SHOP_OWNER |
| `PUT` | `/shops/{id}` | Update shop | ✅ SHOP_OWNER |
| `PATCH` | `/shops/{id}/status` | Update status | ✅ Admin |
| `PATCH` | `/shops/{id}/verify` | Verify shop | ✅ Admin |

#### Create Shop
```http
POST /shops/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "HealthCare Pharmacy",
  "email": "contact@healthcare.com",
  "phone": "+880123456789",
  "address": "123 Dhanmondi Road",
  "city": "Dhaka",
  "area": "Dhanmondi",
  "ward": "15",
  "latitude": 23.7465,
  "longitude": 90.3762,
  "licenseNumber": "DDA-2024-12345",
  "description": "24/7 pharmacy with home delivery"
}
```

---

### 📦 Shop Medicine API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/shop-medicines/shop/{shopId}` | Get shop's inventory | ❌ |
| `GET` | `/shop-medicines/{id}` | Get shop medicine by ID | ❌ |
| `GET` | `/shop-medicines/medicine/{medicineId}` | Find shops selling medicine | ❌ |
| `GET` | `/shop-medicines/shop/{shopId}/search` | Search within shop | ❌ |
| `GET` | `/shop-medicines/in-stock` | Get all in-stock items | ❌ |
| `GET` | `/shop-medicines/my-inventory` | Get owner's inventory | ✅ SHOP_OWNER |
| `POST` | `/shop-medicines/` | Add medicine to inventory | ✅ SHOP_OWNER |
| `PUT` | `/shop-medicines/{id}` | Update shop medicine | ✅ SHOP_OWNER |
| `PATCH` | `/shop-medicines/{id}/stock` | Update stock quantity | ✅ SHOP_OWNER |

#### Add Medicine to Shop
```http
POST /shop-medicines/
Authorization: Bearer <token>
Content-Type: application/json

{
  "medicineId": 123,
  "price": 55.00,
  "discountPrice": 50.00,
  "stockQuantity": 100,
  "batchNumber": "BTH-2026-001",
  "expiryDate": "2027-06-30"
}
```

---

### 🛒 Cart API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cart/` | Get current user's cart |
| `POST` | `/cart/add` | Add item to cart |
| `PUT` | `/cart/item/{itemId}` | Update item quantity |
| `DELETE` | `/cart/item/{itemId}` | Remove item from cart |
| `DELETE` | `/cart/clear` | Clear entire cart |

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "shopMedicineId": 1,
  "quantity": 2
}
```

**Response:**
```json
{
  "id": 1,
  "items": [
    {
      "id": 1,
      "shopMedicine": {
        "id": 1,
        "medicine": {
          "brandName": "Napa",
          "genericName": "Paracetamol"
        },
        "shop": {
          "id": 1,
          "name": "HealthCare Pharmacy"
        },
        "price": 50.00,
        "discountPrice": 45.00
      },
      "quantity": 2,
      "price": 45.00,
      "subtotal": 90.00
    }
  ],
  "totalItems": 2,
  "totalAmount": 90.00
}
```

---

### 📦 Order API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/orders/` | Get user's orders | ✅ USER |
| `GET` | `/orders/{id}` | Get order by ID | ✅ |
| `GET` | `/orders/number/{orderNumber}` | Get by order number | ✅ |
| `GET` | `/orders/status/{status}` | Get by status | ✅ USER |
| `POST` | `/orders/` | Place order | ✅ USER |
| `POST` | `/orders/from-cart` | Place order from cart | ✅ USER |
| `POST` | `/orders/{id}/cancel` | Cancel order | ✅ USER |
| `GET` | `/orders/shop/orders` | Get shop's orders | ✅ SHOP_OWNER |
| `PATCH` | `/orders/{id}/status` | Update order status | ✅ SHOP_OWNER |

#### Place Order from Cart
```http
POST /orders/from-cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingName": "John Doe",
  "shippingPhone": "+880123456789",
  "shippingAddress": "123 Main Street, Apt 4B",
  "shippingCity": "Dhaka",
  "notes": "Please call before delivery"
}
```

**Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-20260118-00001",
  "status": "PENDING",
  "user": {
    "id": 1,
    "name": "John Doe"
  },
  "shop": {
    "id": 1,
    "name": "HealthCare Pharmacy"
  },
  "items": [
    {
      "id": 1,
      "medicineName": "Napa 500mg",
      "quantity": 2,
      "price": 45.00,
      "subtotal": 90.00
    }
  ],
  "subtotal": 90.00,
  "discount": 0.00,
  "shippingCost": 50.00,
  "tax": 0.00,
  "total": 140.00,
  "shippingName": "John Doe",
  "shippingPhone": "+880123456789",
  "shippingAddress": "123 Main Street, Apt 4B",
  "shippingCity": "Dhaka",
  "createdAt": "2026-01-18T10:30:00"
}
```

---

### 🔔 Notification API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications/` | Get all notifications (paginated) |
| `GET` | `/notifications/unread` | Get unread notifications |
| `GET` | `/notifications/unread/count` | Get unread count |
| `POST` | `/notifications/{id}/read` | Mark as read |
| `POST` | `/notifications/read-all` | Mark all as read |
| `DELETE` | `/notifications/{id}` | Delete notification |

---

### 👨‍⚕️ Doctor API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/doctors/` | Get all doctors | ❌ |
| `GET` | `/doctors/{id}` | Get doctor by ID | ❌ |
| `GET` | `/doctors/search` | Search doctors | ❌ |
| `GET` | `/doctors/specialty/{id}` | Get by specialty ID | ❌ |
| `GET` | `/doctors/specialty-name/{name}` | Get by specialty name | ❌ |
| `GET` | `/doctors/top-rated` | Get top rated | ❌ |
| `GET` | `/doctors/locations` | Get all locations | ❌ |
| `GET` | `/doctors/location/{location}` | Get by location | ❌ |
| `GET` | `/doctors/specialties` | Get specialties | ❌ |

#### Search Doctors
```http
GET /doctors/search?q=cardiologist&location=Dhaka&page=0&size=20
```

---

### 🏥 Pharmacy Finder API

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/pharmacy-finder/find` | Find nearest pharmacy with medicine | ❌ |
| `GET` | `/pharmacy-finder/find` | Same as POST (query params) | ❌ |
| `GET` | `/pharmacy-finder/all-locations` | Get all pharmacy locations | ❌ |
| `GET` | `/pharmacy-finder/nearby` | Get pharmacies near location | ❌ |
| `GET` | `/pharmacy-finder/autocomplete` | Medicine name autocomplete | ❌ |

#### Find Nearest Pharmacy
```http
POST /pharmacy-finder/find
Content-Type: application/json

{
  "medicineName": "Napa",
  "latitude": 23.7465,
  "longitude": 90.3762,
  "radiusKm": 5
}
```

**Response:**
```json
{
  "pharmacies": [
    {
      "shop": {
        "id": 1,
        "name": "HealthCare Pharmacy",
        "address": "123 Dhanmondi Road",
        "latitude": 23.7470,
        "longitude": 90.3765
      },
      "distance": 0.5,
      "medicine": {
        "brandName": "Napa",
        "price": 50.00,
        "stockQuantity": 100
      }
    }
  ],
  "totalResults": 5
}
```

---

### 🔧 Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/stats` | Dashboard statistics |
| `GET` | `/admin/users` | Get all users |
| `POST` | `/admin/users/{id}/activate` | Activate user |
| `POST` | `/admin/users/{id}/deactivate` | Deactivate user |
| `GET` | `/admin/shops` | Get all shops |
| `GET` | `/admin/shops/pending` | Get pending shops |
| `POST` | `/admin/shops/{id}/approve` | Approve shop |
| `POST` | `/admin/shops/{id}/reject` | Reject shop |
| `POST` | `/admin/shops/{id}/verify` | Verify shop |
| `GET` | `/admin/orders` | Get all orders |

---

## 📱 Frontend Pages

### Public Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Landing.jsx` | Hero section, features showcase, call-to-action |
| `/auth` | `Auth/index.jsx` | Login/Register forms with role selection |
| `/marketplace` | `Marketplace/index.jsx` | Browse medicines with map, add to cart |
| `/marketplace/:id` | `MedicineDetail.jsx` | Medicine details, alternatives, shop listings |
| `/cart` | `Cart/index.jsx` | Shopping cart, checkout flow |
| `/medbase` | `MedBase/index.jsx` | Medicine database search and browse |
| `/pharmacy-finder` | `PharmacyFinder/index.jsx` | Find nearby pharmacies on map |
| `/find-doctor` | `FindDoctor/index.jsx` | Doctor directory with filters |

### Protected Pages (Require Authentication)

| Route | Component | Role | Description |
|-------|-----------|------|-------------|
| `/dashboard` | `Dashboard/index.jsx` | All | Overview, today's doses, stats |
| `/dashboard/medications` | `Medications.jsx` | All | Medication management |
| `/dashboard/calendar` | `Calendar.jsx` | All | FullCalendar dose view |
| `/dashboard/orders` | `Orders.jsx` | All | Order history |
| `/dashboard/profile` | `Profile.jsx` | All | User profile, health info |
| `/dashboard/settings` | `Settings.jsx` | All | Preferences |
| `/shop` | `ShopDashboard.jsx` | SHOP_OWNER | Shop management |
| `/admin` | `AdminDashboard.jsx` | ADMIN | Admin controls |

---

## 🔐 Authentication

### JWT Token Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Client  │         │  Server  │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /auth/login  │                    │
     │  {email, password} │                    │
     │───────────────────>│                    │
     │                    │  Validate creds    │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │                    │                    │
     │  {accessToken,     │                    │
     │   refreshToken}    │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  GET /medications  │                    │
     │  Authorization:    │                    │
     │  Bearer <token>    │                    │
     │───────────────────>│                    │
     │                    │  Validate JWT      │
     │                    │  Extract user      │
     │                    │───────────────────>│
     │                    │<───────────────────│
     │  {medications}     │                    │
     │<───────────────────│                    │
     │                    │                    │
     │  POST /auth/refresh│                    │
     │  {refreshToken}    │                    │
     │───────────────────>│                    │
     │                    │  Validate refresh  │
     │                    │───────────────────>│
     │  {new accessToken} │                    │
     │<───────────────────│                    │
```

### Token Details

| Token | Expiry | Purpose |
|-------|--------|---------|
| Access Token | 15 minutes | API authentication |
| Refresh Token | 7 days | Obtain new access token |

### Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        return http
            .cors(cors -> cors.configurationSource(corsConfig))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/medicines/**").permitAll()
                .requestMatchers("/api/v1/shops/**").permitAll()
                .requestMatchers("/api/v1/doctors/**").permitAll()
                .requestMatchers("/api/v1/pharmacy-finder/**").permitAll()
                // Protected endpoints
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/v1/shop-medicines/my-**").hasRole("SHOP_OWNER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

---

## 🗂️ Class Diagrams

### Service Layer Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                        Service Layer                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐ │
│  │   AuthService   │    │   UserService   │    │ MedicationSvc  │ │
│  ├─────────────────┤    ├─────────────────┤    ├────────────────┤ │
│  │ + register()    │    │ + getProfile()  │    │ + create()     │ │
│  │ + login()       │    │ + updateProfile()│   │ + update()     │ │
│  │ + refreshToken()│    │ + changePassword()│  │ + delete()     │ │
│  │ + validateToken()│   │ + getAllUsers() │    │ + findByUser() │ │
│  └────────┬────────┘    └────────┬────────┘    │ + getLowStock()│ │
│           │                      │              └───────┬────────┘ │
│           ▼                      ▼                      ▼          │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                     Repository Layer                         │  │
│  │  UserRepository │ RoleRepository │ MedicationRepository │... │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐ │
│  │  DoseLogService │    │   CartService   │    │  OrderService  │ │
│  ├─────────────────┤    ├─────────────────┤    ├────────────────┤ │
│  │ + logDose()     │    │ + getCart()     │    │ + placeOrder() │ │
│  │ + markTaken()   │    │ + addItem()     │    │ + getOrders()  │ │
│  │ + markSkipped() │    │ + updateItem()  │    │ + updateStatus()│ │
│  │ + getToday()    │    │ + removeItem()  │    │ + cancelOrder()│ │
│  │ + getAdherence()│    │ + clearCart()   │    │ + getByShop()  │ │
│  └─────────────────┘    └─────────────────┘    └────────────────┘ │
│                                                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐ │
│  │ MedicineService │    │MedicineShopSvc  │    │ShopMedicineSvc │ │
│  ├─────────────────┤    ├─────────────────┤    ├────────────────┤ │
│  │ + search()      │    │ + create()      │    │ + addToShop()  │ │
│  │ + getByGeneric()│    │ + update()      │    │ + updateStock()│ │
│  │ + getAlternatives()│ │ + verify()      │    │ + search()     │ │
│  │ + getPopular()  │    │ + getByOwner()  │    │ + getByShop()  │ │
│  └─────────────────┘    └─────────────────┘    └────────────────┘ │
│                                                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌────────────────┐ │
│  │NotificationSvc  │    │  DoctorService  │    │PharmacyFinderSvc││
│  ├─────────────────┤    ├─────────────────┤    ├────────────────┤ │
│  │ + create()      │    │ + search()      │    │ + findNearest()│ │
│  │ + getUnread()   │    │ + getBySpecialty()│  │ + getNearby()  │ │
│  │ + markRead()    │    │ + getTopRated() │    │ + autocomplete()│ │
│  │ + sendReminder()│    │ + getLocations()│    │ + getAllLocs() │ │
│  └─────────────────┘    └─────────────────┘    └────────────────┘ │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### DTO Mapping Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Request    │     │   Service    │     │   Response   │
│     DTO      │────>│   Method     │────>│     DTO      │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ Validation   │     │   Entity     │     │  JSON        │
│ @Valid       │     │   Object     │     │  Serialization│
└──────────────┘     └──────────────┘     └──────────────┘

Example:
MedicationRequest → MedicationService.create() → Medication → MedicationResponse
     ↓                        ↓                      ↓              ↓
  {name,dosage}        save to DB           JPA Entity      {id,name,dosage,schedules}
```

---

## ⚙️ Configuration

### Backend Configuration (`application.yml`)

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://<host>:5432/pilltrack
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME}
    password: ${MAIL_PASSWORD}
    properties:
      mail.smtp.auth: true
      mail.smtp.starttls.enable: true

app:
  jwt:
    secret: ${JWT_SECRET}  # 256-bit key
    access-token-expiration: 900000      # 15 minutes
    refresh-token-expiration: 604800000  # 7 days
  
  cors:
    allowed-origins: http://localhost:5173

springdoc:
  api-docs:
    path: /api-docs
  swagger-ui:
    path: /swagger-ui.html
```

### Frontend Configuration

**API Base URL** (`src/services/api.js`):
```javascript
const API_BASE_URL = 'http://localhost:8080/api/v1';
```

**Timezone** (`src/utils/timezone.js`):
```javascript
export const DEFAULT_TIMEZONE = 'Asia/Dhaka';
```

---

## 📂 Data Sources

The `med_DB/` folder contains seed data for the medicine and doctor databases:

| File | Records | Description |
|------|---------|-------------|
| `medicine.csv` | 21,716 | Complete medicine database with brand names, generics, manufacturers, prices |
| `doctors_combined_data.csv` | 7,293 | Doctor directory with specialties, chambers, locations |
| `indication.csv` | - | Medicine indications and uses |

### Sample Medicine Data
```csv
brand_id,brand_name,type,dosage_form,generic_name,strength,manufacturer,unit_price,pack_price
1,Napa,allopathic,Tablet,Paracetamol,500mg,Beximco Pharmaceuticals,2.50,50.00
```

### Sample Doctor Data
```csv
name,education,specialty,experience,chamber,location,consultation_fee,rating
Dr. John Smith,MBBS FCPS,Cardiology,15,City Hospital,Dhaka,1000,4.8
```

---

## 🧪 API Testing

### Swagger UI
Access the interactive API documentation at:
```
http://localhost:8080/api/swagger-ui.html
```

### Sample cURL Commands

**Register:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"USER"}'
```

**Login:**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Get Medications (Authenticated):**
```bash
curl http://localhost:8080/api/v1/medications/ \
  -H "Authorization: Bearer <your_access_token>"
```

---

## 📝 License

This project is developed for educational purposes as part of the Advanced Object-Oriented Programming (AOOP) course.

---

## 👥 Contributors

- **Developer**: PillTrack Team
- **Course**: Advanced Object-Oriented Programming (AOOP)
- **Year**: 2026

---

<div align="center">

**Made with ❤️ for better medication management**

</div>
