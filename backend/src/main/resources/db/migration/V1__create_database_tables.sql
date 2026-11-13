-- ==============================================================================
-- Flyway Migration V1: Create Database Schema for StayFinder
-- Target Engine: MySQL 8.4 (InnoDB)
-- ==============================================================================

-- 1. HOTEL TABLE
CREATE TABLE IF NOT EXISTS hotel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    star_rating DECIMAL(2, 1) DEFAULT 4.0 CHECK (star_rating >= 1.0 AND star_rating <= 5.0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hotel_location (location),
    INDEX idx_hotel_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. AMENITY TABLE
CREATE TABLE IF NOT EXISTS amenity (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    icon VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. HOTEL_AMENITY TABLE (Many-to-Many join table)
CREATE TABLE IF NOT EXISTS hotel_amenity (
    hotel_id BIGINT NOT NULL,
    amenity_id BIGINT NOT NULL,
    PRIMARY KEY (hotel_id, amenity_id),
    CONSTRAINT fk_hotel_amenity_hotel FOREIGN KEY (hotel_id) 
        REFERENCES hotel(id) ON DELETE CASCADE,
    CONSTRAINT fk_hotel_amenity_amenity FOREIGN KEY (amenity_id) 
        REFERENCES amenity(id) ON DELETE CASCADE,
    INDEX idx_hotel_amenity_amenity_id (amenity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ROOM_TYPE TABLE
CREATE TABLE IF NOT EXISTS room_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price > 0),
    max_occupancy INT NOT NULL CHECK (max_occupancy > 0),
    bed_type VARCHAR(50),
    room_size_sqm INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_type_hotel FOREIGN KEY (hotel_id) 
        REFERENCES hotel(id) ON DELETE CASCADE,
    INDEX idx_room_type_hotel_id (hotel_id),
    INDEX idx_room_type_price (base_price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ROOM TABLE (Physical hotel rooms)
CREATE TABLE IF NOT EXISTS room (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_type_id BIGINT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    floor_number INT,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_hotel FOREIGN KEY (hotel_id) 
        REFERENCES hotel(id) ON DELETE CASCADE,
    CONSTRAINT fk_room_room_type FOREIGN KEY (room_type_id) 
        REFERENCES room_type(id) ON DELETE CASCADE,
    CONSTRAINT uk_hotel_room_number UNIQUE (hotel_id, room_number),
    INDEX idx_room_hotel_status (hotel_id, status),
    INDEX idx_room_type_status (room_type_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BOOKING TABLE
CREATE TABLE IF NOT EXISTS booking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(50) NOT NULL UNIQUE,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(50),
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_room FOREIGN KEY (room_id) 
        REFERENCES room(id) ON DELETE RESTRICT,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date),
    INDEX idx_booking_room_availability (room_id, status, check_in_date, check_out_date),
    INDEX idx_booking_guest_email (guest_email),
    INDEX idx_booking_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
