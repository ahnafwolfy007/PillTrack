"""
PillTrack Database Setup Script
Creates all necessary tables and imports medicine/indication data from CSV
"""

import psycopg2
import csv
import re
from datetime import datetime

# Database connection settings
DB_CONFIG = {
    'host': 'pg-21f07101-edusyncuiu.i.aivencloud.com',
    'port': 16537,
    'database': 'defaultdb',
    'user': 'avnadmin',
    'password': 'AVNS_mp_gm0Sfdjzv9LazqwK',
    'sslmode': 'require'
}

# SQL to create all tables
CREATE_TABLES_SQL = """
-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse dependency order (for clean setup)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS dose_logs CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS shop_medicines CASCADE;
DROP TABLE IF EXISTS medicine_shops CASCADE;
DROP TABLE IF EXISTS medicines CASCADE;
DROP TABLE IF EXISTS medicine_categories CASCADE;
DROP TABLE IF EXISTS medicine_manufacturers CASCADE;
DROP TABLE IF EXISTS indications CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

-- 2. Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    profile_image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_token_expiry TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. User Preferences table
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    reminder_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_sound BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_vibration BOOLEAN NOT NULL DEFAULT TRUE,
    email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
    sms_notifications BOOLEAN NOT NULL DEFAULT FALSE,
    low_stock_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    refill_reminders BOOLEAN NOT NULL DEFAULT TRUE,
    low_stock_threshold INTEGER NOT NULL DEFAULT 7,
    language VARCHAR(10) NOT NULL DEFAULT 'en',
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Dhaka',
    theme VARCHAR(20) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Indications table (from indication.csv)
CREATE TABLE indications (
    id SERIAL PRIMARY KEY,
    indication_id INTEGER UNIQUE,
    indication_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255),
    generics_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Medicine Manufacturers table
CREATE TABLE medicine_manufacturers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Medicine Categories table
CREATE TABLE medicine_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon_name VARCHAR(50),
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Medicines table (matching CSV columns exactly)
CREATE TABLE medicines (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER,
    brand_name VARCHAR(200) NOT NULL,
    type VARCHAR(50),
    slug VARCHAR(255),
    dosage_form VARCHAR(100),
    generic_name VARCHAR(500),
    strength VARCHAR(100),
    manufacturer_id INTEGER REFERENCES medicine_manufacturers(id),
    unit_quantity VARCHAR(100),
    container_type VARCHAR(100),
    unit_price DECIMAL(12,2),
    pack_quantity DECIMAL(10,2),
    pack_price DECIMAL(12,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Medicine Shops table
CREATE TABLE medicine_shops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE,
    description TEXT,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    area VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Bangladesh',
    license_number VARCHAR(50) UNIQUE,
    tax_id VARCHAR(50),
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    total_products INTEGER NOT NULL DEFAULT 0,
    total_orders INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. Shop Medicines table
CREATE TABLE shop_medicines (
    id SERIAL PRIMARY KEY,
    shop_id INTEGER NOT NULL REFERENCES medicine_shops(id) ON DELETE CASCADE,
    medicine_id INTEGER NOT NULL REFERENCES medicines(id),
    price DECIMAL(12,2) NOT NULL,
    discount_price DECIMAL(12,2),
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    batch_number VARCHAR(50),
    expiry_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, medicine_id)
);

-- 10. Medications table (user's personal medications)
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency INTEGER NOT NULL DEFAULT 1,
    inventory INTEGER NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT,
    prescribed_by VARCHAR(100),
    image_url VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. Reminders table
CREATE TABLE reminders (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    reminder_type VARCHAR(20) NOT NULL DEFAULT 'FIXED_TIME',
    schedule_info VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Dose Logs table
CREATE TABLE dose_logs (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP NOT NULL,
    taken_time TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. Prescriptions table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    verified_by INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    verification_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. Carts table
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    total_items INTEGER NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. Cart Items table
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    shop_medicine_id INTEGER NOT NULL REFERENCES shop_medicines(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(12,2) NOT NULL,
    discount_price DECIMAL(12,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, shop_medicine_id)
);

-- 16. Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    shop_id INTEGER NOT NULL REFERENCES medicine_shops(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subtotal DECIMAL(12,2) NOT NULL,
    shipping_cost DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    shipping_name VARCHAR(100),
    shipping_phone VARCHAR(20),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_area VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    customer_notes TEXT,
    shop_notes TEXT,
    cancellation_reason TEXT,
    requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
    prescription_verified BOOLEAN NOT NULL DEFAULT FALSE,
    prescription_id INTEGER REFERENCES prescriptions(id),
    confirmed_at TIMESTAMP,
    processing_at TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add order_id foreign key to prescriptions after orders table is created
ALTER TABLE prescriptions ADD CONSTRAINT fk_prescription_order FOREIGN KEY (order_id) REFERENCES orders(id);

-- 17. Order Items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    shop_medicine_id INTEGER NOT NULL REFERENCES shop_medicines(id),
    medicine_name VARCHAR(150),
    medicine_strength VARCHAR(50),
    medicine_form VARCHAR(50),
    manufacturer_name VARCHAR(150),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    discount_price DECIMAL(12,2),
    discount DECIMAL(12,2) DEFAULT 0,
    line_total DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 18. Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    transaction_id VARCHAR(100) UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'BDT',
    payment_method VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    gateway_response TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_medicines_brand_name ON medicines(brand_name);
CREATE INDEX idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX idx_medicines_slug ON medicines(slug);
CREATE INDEX idx_medicines_brand_id ON medicines(brand_id);
CREATE INDEX idx_medicines_manufacturer ON medicines(manufacturer_id);
CREATE INDEX idx_indications_name ON indications(indication_name);
CREATE INDEX idx_indications_slug ON indications(slug);
CREATE INDEX idx_shop_medicines_shop ON shop_medicines(shop_id);
CREATE INDEX idx_shop_medicines_medicine ON shop_medicines(medicine_id);
CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_dose_logs_medication ON dose_logs(medication_id);
CREATE INDEX idx_dose_logs_scheduled ON dose_logs(scheduled_time);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_shop ON orders(shop_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);

-- Insert default roles
INSERT INTO roles (name) VALUES ('ADMIN'), ('USER'), ('SHOP_OWNER');

-- Insert default admin user (password: admin123)
-- Note: Hash generated with BCrypt and 10 rounds
INSERT INTO users (name, email, password, role_id, is_active, is_email_verified, created_at, updated_at)
VALUES (
    'Admin User',
    'admin@pilltrack.com',
    '$2a$10$EqKcp1WFKVQISheBxkguQuqDFOXEewZVSWXeHh6e7bP3FGlg6m7Ji',
    1,
    TRUE,
    TRUE,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Insert some default medicine categories
INSERT INTO medicine_categories (name, slug, description, icon_name, is_active, sort_order) VALUES
('Allopathic', 'allopathic', 'Modern/Western medicines', 'pill', TRUE, 1),
('Herbal', 'herbal', 'Herbal and natural medicines', 'leaf', TRUE, 2),
('Ayurvedic', 'ayurvedic', 'Traditional Ayurvedic medicines', 'flower', TRUE, 3),
('Homeopathic', 'homeopathic', 'Homeopathic medicines', 'droplet', TRUE, 4),
('Unani', 'unani', 'Unani medicines', 'moon', TRUE, 5);
"""


def create_slug(text):
    """Create a URL-safe slug from text"""
    if not text:
        return None
    slug = text.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug[:150]


def get_or_create_manufacturer(cursor, name, manufacturers_cache):
    """Get manufacturer ID or create new one"""
    if not name or name.strip() == '':
        return None
    
    name = name.strip()
    
    # Check cache first
    if name in manufacturers_cache:
        return manufacturers_cache[name]
    
    slug = create_slug(name)
    
    # Check database
    cursor.execute("SELECT id FROM medicine_manufacturers WHERE name = %s", (name,))
    result = cursor.fetchone()
    if result:
        manufacturers_cache[name] = result[0]
        return result[0]
    
    # Create new
    cursor.execute(
        """INSERT INTO medicine_manufacturers (name, slug, is_active, created_at, updated_at) 
           VALUES (%s, %s, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
           RETURNING id""",
        (name, slug)
    )
    new_id = cursor.fetchone()[0]
    manufacturers_cache[name] = new_id
    return new_id


def import_indications(cursor, csv_file_path):
    """Import indications from CSV file"""
    imported = 0
    skipped = 0
    
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            try:
                indication_id = row.get('indication id', '').strip()
                indication_name = row.get('indication name', '').strip()
                slug = row.get('slug', '').strip()
                generics_count = row.get('generics count', '0').strip()
                
                if not indication_name:
                    skipped += 1
                    continue
                
                try:
                    indication_id = int(indication_id) if indication_id else None
                    generics_count = int(generics_count) if generics_count else 0
                except ValueError:
                    indication_id = None
                    generics_count = 0
                
                cursor.execute("""
                    INSERT INTO indications (indication_id, indication_name, slug, generics_count, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                    ON CONFLICT (indication_id) DO NOTHING
                """, (indication_id, indication_name, slug, generics_count))
                
                imported += 1
                
            except Exception as e:
                skipped += 1
                continue
    
    return imported, skipped


def import_medicines(cursor, csv_file_path):
    """Import medicines from CSV file"""
    medicines_imported = 0
    medicines_skipped = 0
    manufacturers_cache = {}
    seen_slugs = set()
    
    with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            try:
                brand_name = row.get('brand name', '').strip()
                if not brand_name:
                    medicines_skipped += 1
                    continue
                
                # Get values from CSV columns
                brand_id_str = row.get('brand id', '').strip()
                try:
                    brand_id = int(brand_id_str) if brand_id_str else None
                except ValueError:
                    brand_id = None
                
                med_type = row.get('type', '').strip()
                slug = row.get('slug', '').strip()
                dosage_form = row.get('dosage form', '').strip()
                generic_name = row.get('generic', '').strip()
                strength = row.get('strength', '').strip()
                manufacturer_name = row.get('manufacturer', '').strip()
                unit_quantity = row.get('unit_quantity', '').strip()
                container_type = row.get('container_type', '').strip()
                
                # Parse numeric values
                unit_price_str = row.get('unit_price', '').strip()
                pack_quantity_str = row.get('pack_quantity', '').strip()
                pack_price_str = row.get('pack_price', '').strip()
                
                try:
                    unit_price = float(unit_price_str) if unit_price_str else None
                except ValueError:
                    unit_price = None
                
                try:
                    pack_quantity = float(pack_quantity_str) if pack_quantity_str else None
                except ValueError:
                    pack_quantity = None
                    
                try:
                    pack_price = float(pack_price_str) if pack_price_str else None
                except ValueError:
                    pack_price = None
                
                # Handle duplicate slugs by appending brand_id
                original_slug = slug
                if slug in seen_slugs:
                    slug = f"{slug}-{brand_id}" if brand_id else f"{slug}-{medicines_imported}"
                seen_slugs.add(slug)
                
                # Get or create manufacturer
                manufacturer_id = get_or_create_manufacturer(cursor, manufacturer_name, manufacturers_cache)
                
                # Insert medicine
                cursor.execute("""
                    INSERT INTO medicines (
                        brand_id, brand_name, type, slug, dosage_form,
                        generic_name, strength, manufacturer_id,
                        unit_quantity, container_type, unit_price,
                        pack_quantity, pack_price,
                        is_active, view_count, created_at, updated_at
                    ) VALUES (
                        %s, %s, %s, %s, %s,
                        %s, %s, %s,
                        %s, %s, %s,
                        %s, %s,
                        TRUE, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    )
                """, (
                    brand_id, brand_name, med_type, slug, dosage_form,
                    generic_name, strength, manufacturer_id,
                    unit_quantity, container_type, unit_price,
                    pack_quantity, pack_price
                ))
                
                medicines_imported += 1
                
                if medicines_imported % 1000 == 0:
                    print(f"  Imported {medicines_imported} medicines...")
                    
            except Exception as e:
                medicines_skipped += 1
                continue
    
    return medicines_imported, medicines_skipped


def main():
    print("=" * 60)
    print("PillTrack Database Setup")
    print("=" * 60)
    
    try:
        # Connect to database
        print("\n[1/4] Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = False
        cursor = conn.cursor()
        print("  ✓ Connected successfully!")
        
        # Create tables
        print("\n[2/4] Creating database tables...")
        cursor.execute(CREATE_TABLES_SQL)
        conn.commit()
        print("  ✓ All tables created successfully!")
        print("  ✓ Default roles (ADMIN, USER, SHOP_OWNER) inserted!")
        print("  ✓ Admin user created (admin@pilltrack.com / admin123)")
        print("  ✓ Default medicine categories inserted!")
        
        # Import indications from CSV
        print("\n[3/4] Importing indications from CSV...")
        indication_csv = r"K:\10th\aoop\PillTrack\med_DB\indication.csv"
        ind_imported, ind_skipped = import_indications(cursor, indication_csv)
        conn.commit()
        print(f"  ✓ Imported {ind_imported} indications!")
        print(f"  ✓ Skipped {ind_skipped} invalid entries")
        
        # Import medicines from CSV
        print("\n[4/4] Importing medicines from CSV...")
        medicine_csv = r"K:\10th\aoop\PillTrack\med_DB\medicine.csv"
        med_imported, med_skipped = import_medicines(cursor, medicine_csv)
        conn.commit()
        print(f"  ✓ Imported {med_imported} medicines!")
        print(f"  ✓ Skipped {med_skipped} invalid entries")
        
        # Get counts
        cursor.execute("SELECT COUNT(*) FROM medicines")
        medicine_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM medicine_manufacturers")
        manufacturer_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM indications")
        indication_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM medicine_categories")
        category_count = cursor.fetchone()[0]
        
        print("\n" + "=" * 60)
        print("Database Setup Complete!")
        print("=" * 60)
        print(f"\nSummary:")
        print(f"  • Total Medicines: {medicine_count}")
        print(f"  • Total Manufacturers: {manufacturer_count}")
        print(f"  • Total Indications: {indication_count}")
        print(f"  • Total Categories: {category_count}")
        print(f"  • Default Admin: admin@pilltrack.com / admin123")
        print("\n✓ Database is ready for use!")
        
    except Exception as e:
        print(f"\n✗ Error: {str(e)}")
        if 'conn' in locals():
            conn.rollback()
        raise
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    main()
