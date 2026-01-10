# PillTrack Backend

A comprehensive Spring Boot backend for the PillTrack medication management system.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (USER, SHOP_OWNER, ADMIN)
  - Password encryption with BCrypt

- **Medication Management**
  - Track personal medications
  - Set medication reminders
  - Log doses and track adherence
  - Low stock alerts

- **MedBase**
  - Comprehensive medicine database
  - Search medicines by name, generic name, category
  - View medicine details, alternatives, and interactions

- **Marketplace**
  - Browse medicine shops
  - Shop owner inventory management
  - Shopping cart functionality
  - Order management

- **Payment Integration**
  - SSLCommerz payment gateway (Sandbox)
  - Payment verification and IPN handling

- **Notifications**
  - In-app notifications
  - Email notifications
  - Medication reminders via Quartz scheduler

## Tech Stack

- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Database**: PostgreSQL (Aiven Cloud)
- **Security**: Spring Security + JWT
- **Scheduler**: Quartz
- **Documentation**: OpenAPI 3 (Swagger)
- **Email**: Spring Mail (Gmail SMTP)

## Prerequisites

- Java 17 or higher
- Maven 3.8+
- PostgreSQL database (or use the provided Aiven Cloud connection)

## Configuration

The application is configured via `src/main/resources/application.yml`:

```yaml
# Database
spring.datasource.url=jdbc:postgresql://pg-21f07101-edusyncuiu.i.aivencloud.com:16537/defaultdb?sslmode=require
spring.datasource.username=avnadmin

# JWT
app.jwt.secret=your-secret-key
app.jwt.expiration=86400000 # 24 hours
app.jwt.refresh-expiration=604800000 # 7 days

# SSLCommerz (Sandbox)
sslcommerz.store-id=pillt6962a427ee7d7
sslcommerz.api-url=https://sandbox.sslcommerz.com

# Email
spring.mail.host=smtp.gmail.com
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

## Running the Application

### Development

```bash
# Navigate to backend directory
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

### Production

```bash
# Build JAR
mvn clean package -DskipTests

# Run JAR
java -jar target/pilltrack-0.0.1-SNAPSHOT.jar
```

## API Documentation

Once the application is running, access the API documentation at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/api-docs

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile
- `POST /api/v1/users/me/change-password` - Change password

### Medications
- `GET /api/v1/medications` - Get user medications
- `POST /api/v1/medications` - Create medication
- `PUT /api/v1/medications/{id}` - Update medication
- `DELETE /api/v1/medications/{id}` - Delete medication

### Dose Logs
- `GET /api/v1/dose-logs/today` - Get today's doses
- `POST /api/v1/dose-logs` - Log a dose
- `POST /api/v1/dose-logs/{id}/take` - Mark dose as taken
- `POST /api/v1/dose-logs/{id}/skip` - Mark dose as skipped

### Medicines (MedBase)
- `GET /api/v1/medicines` - Get all medicines
- `GET /api/v1/medicines/{id}` - Get medicine details
- `GET /api/v1/medicines/search?query=` - Search medicines
- `GET /api/v1/medicines/{id}/alternatives` - Get alternatives

### Categories
- `GET /api/v1/categories` - Get all categories

### Manufacturers
- `GET /api/v1/manufacturers` - Get all manufacturers

### Shops
- `GET /api/v1/shops` - Get active shops
- `GET /api/v1/shops/{id}` - Get shop details
- `POST /api/v1/shops` - Create shop (SHOP_OWNER)

### Shop Medicines
- `GET /api/v1/shop-medicines/shop/{shopId}` - Get shop inventory
- `POST /api/v1/shop-medicines` - Add to inventory (SHOP_OWNER)

### Cart
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add to cart
- `PUT /api/v1/cart/items/{id}` - Update quantity
- `DELETE /api/v1/cart/items/{id}` - Remove from cart

### Orders
- `GET /api/v1/orders` - Get user orders
- `POST /api/v1/orders` - Place order
- `POST /api/v1/orders/from-cart` - Order from cart
- `POST /api/v1/orders/{id}/cancel` - Cancel order

### Payments
- `POST /api/v1/payments/initiate/{orderId}` - Initiate payment
- `GET /api/v1/payments/order/{orderId}` - Get payment details

### Notifications
- `GET /api/v1/notifications` - Get notifications
- `GET /api/v1/notifications/unread/count` - Get unread count
- `POST /api/v1/notifications/{id}/read` - Mark as read

### Prescriptions
- `GET /api/v1/prescriptions` - Get prescriptions
- `POST /api/v1/prescriptions` - Upload prescription
- `POST /api/v1/prescriptions/{id}/verify` - Verify (ADMIN)

### Admin
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - Get all users
- `GET /api/v1/admin/shops/pending` - Get pending shops
- `POST /api/v1/admin/shops/{id}/approve` - Approve shop

## Default Admin Credentials

```
Email: admin@pilltrack.com
Password: admin123
```

## Project Structure

```
backend/
├── src/main/java/com/pilltrack/
│   ├── config/           # Configuration classes
│   ├── controller/       # REST controllers
│   ├── dto/              # Data Transfer Objects
│   │   ├── request/      # Request DTOs
│   │   └── response/     # Response DTOs
│   ├── exception/        # Custom exceptions
│   ├── job/              # Quartz jobs
│   ├── model/            # JPA entities
│   │   └── enums/        # Enumerations
│   ├── repository/       # JPA repositories
│   ├── security/         # Security components
│   ├── service/          # Business logic
│   └── util/             # Utility classes
├── src/main/resources/
│   └── application.yml   # Application configuration
└── pom.xml               # Maven dependencies
```

## License

MIT License
