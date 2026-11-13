-- ==============================================================================
-- Flyway Migration V2: Insert Realistic Sample Data for StayFinder
-- Target Engine: MySQL 8.4
-- ==============================================================================

-- 1. INSERT AMENITIES
INSERT INTO amenity (id, name, description, icon) VALUES
(1, 'High-Speed Wi-Fi', 'Complimentary high-speed wireless internet access across all rooms and common areas', 'wifi'),
(2, 'Swimming Pool', 'Outdoor temperature-controlled swimming pool with lounging sundeck', 'pool'),
(3, 'Free Parking', 'Secure on-site valet and self-parking facilities', 'local_parking'),
(4, 'Fine Dining Restaurant', 'Multi-cuisine restaurant offering breakfast buffet and a la carte menus', 'restaurant'),
(5, 'Air Conditioning', 'Individual climate control air conditioning system in every room', 'ac_unit'),
(6, 'Spa & Wellness', 'Full-service wellness spa with traditional therapy and steam bath', 'spa'),
(7, 'Fitness Center', 'Fully equipped modern gym with cardio and strength training equipment', 'fitness_center'),
(8, 'Beach Access', 'Direct private walkway access to sandy beach shores', 'beach_access'),
(9, 'Airport Shuttle', 'Scheduled shuttle transportation to and from the international airport', 'airport_shuttle'),
(10, '24/7 Room Service', 'Round-the-clock room dining service and personal concierge', 'room_service');

-- 2. INSERT FIVE DIVERSE HOTELS
INSERT INTO hotel (id, name, location, address, description, phone, email, star_rating) VALUES
(1, 'The Grand Azure Resort & Spa', 'Goa, India', 'Miramar Beach Road, Panaji, Goa 403001', 
 'An exquisite luxury beachfront resort overlooking the Arabian Sea, featuring lush tropical gardens, lagoon pools, and world-class hospitality.',
 '+91-832-2456789', 'reservations@grandazuregoa.com', 4.8),

(2, 'Heritage Haveli Palace', 'Jaipur, Rajasthan', 'Amer Road, Near Jal Mahal, Jaipur, Rajasthan 302001', 
 'A restored 18th-century royal heritage retreat showcasing authentic Rajput architecture, handcrafted jharokhas, and vibrant cultural evenings.',
 '+91-141-2678901', 'contact@heritagehaveli.com', 4.7),

(3, 'Skyline Grand Horizon Hotel', 'Mumbai, Maharashtra', 'G Block, Bandra Kurla Complex, Bandra East, Mumbai 400051', 
 'A sophisticated contemporary business hotel located in the heart of Mumbai financial district, featuring panoramic skyline vistas and executive lounges.',
 '+91-22-67891234', 'stay@skylinegrand.com', 4.6),

(4, 'Pine Valley Mountain Lodge', 'Manali, Himachal Pradesh', 'Hadimba Temple Road, Old Manali, Manali, Himachal Pradesh 175131', 
 'A cozy cedar-wood alpine lodge surrounded by snow-capped Himalayan peaks and fragrant pine forests, offering warm fireplaces and trekking trails.',
 '+91-1902-254321', 'info@pinevalleymanali.com', 4.5),

(5, 'Serene Palms Backwater Retreat', 'Alleppey, Kerala', 'Punnamada Finishing Point Road, Alappuzha, Kerala 688013', 
 'An eco-luxe sanctuary set along tranquil Kerala backwaters, offering traditional Ayurvedic wellness rejuvenation and private houseboat cruises.',
 '+91-477-2244556', 'welcome@serenepalms.com', 4.9);

-- 3. LINK HOTELS AND AMENITIES (Many-to-Many)
-- The Grand Azure Resort & Spa (Amenities: 1, 2, 3, 4, 5, 6, 8, 9, 10)
INSERT INTO hotel_amenity (hotel_id, amenity_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 8), (1, 9), (1, 10),
-- Heritage Haveli Palace (Amenities: 1, 2, 3, 4, 5, 6, 10)
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 10),
-- Skyline Grand Horizon Hotel (Amenities: 1, 3, 4, 5, 7, 9, 10)
(3, 1), (3, 3), (3, 4), (3, 5), (3, 7), (3, 9), (3, 10),
-- Pine Valley Mountain Lodge (Amenities: 1, 3, 4, 5, 10)
(4, 1), (4, 3), (4, 4), (4, 5), (4, 10),
-- Serene Palms Backwater Retreat (Amenities: 1, 2, 3, 4, 5, 6, 9, 10)
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 9), (5, 10);

-- 4. INSERT ROOM TYPES
INSERT INTO room_type (id, hotel_id, name, description, base_price, max_occupancy, bed_type, room_size_sqm) VALUES
-- Hotel 1 Room Types
(1, 1, 'Deluxe Ocean View', 'Spacious room with a private balcony offering unobstructed panoramic views of the Arabian Sea.', 18500.00, 2, 'King Bed', 48),
(2, 1, 'Azure Presidential Villa', 'Ultra-luxurious private villa featuring a dedicated plunge pool, marble bath, and personal butler service.', 45000.00, 4, '2 King Beds', 125),

-- Hotel 2 Room Types
(3, 2, 'Royal Heritage Suite', 'Regal suite adorned with traditional frescoes, carved wooden furnishings, and a palace courtyard view.', 12500.00, 3, 'King Bed + Daybed', 55),
(4, 2, 'Maharani Deluxe', 'Charming heritage room featuring Rajput architectural accents, plush bedding, and modern bathroom amenities.', 8500.00, 2, 'Queen Bed', 38),

-- Hotel 3 Room Types
(5, 3, 'Executive Business King', 'Sleek soundproofed room with an ergonomic work desk, high-speed Wi-Fi, and access to the executive club lounge.', 9500.00, 2, 'King Bed', 42),
(6, 3, 'Premier City Suite', 'Expansive corner suite featuring floor-to-ceiling glass windows with stunning Mumbai skyline views and a separate living lounge.', 16000.00, 3, 'King Bed + Sofa Bed', 68),

-- Hotel 4 Room Types
(7, 4, 'Cedar Wood Chalet', 'Rustic handcrafted wooden chalet with an authentic stone fireplace and picturesque snow peak views.', 7200.00, 2, 'Queen Bed', 36),
(8, 4, 'Panoramic Family Suite', 'Two-bedroom alpine suite with wooden balconies overlooking the pine forest, ideal for families.', 13500.00, 4, '2 Queen Beds', 72),

-- Hotel 5 Room Types
(9, 5, 'Waterfront Cottage', 'Serene eco-cottage on stilts overlooking the backwaters, featuring open-air rain showers and bamboo decor.', 11000.00, 2, 'King Bed', 52),
(10, 5, 'Luxury Houseboat Suite', 'Exclusive private suite aboard a traditionally crafted wooden Kettuvallam cruising the tranquil backwaters.', 22000.00, 2, 'King Bed', 80);

-- 5. INSERT PHYSICAL ROOMS
INSERT INTO room (id, hotel_id, room_type_id, room_number, floor_number, status) VALUES
-- Hotel 1 Rooms
(1, 1, 1, '101', 1, 'AVAILABLE'),
(2, 1, 1, '102', 1, 'AVAILABLE'),
(3, 1, 1, '103', 1, 'AVAILABLE'),
(4, 1, 2, 'V-01', 1, 'AVAILABLE'),
(5, 1, 2, 'V-02', 1, 'AVAILABLE'),

-- Hotel 2 Rooms
(6, 2, 3, '201', 2, 'AVAILABLE'),
(7, 2, 3, '202', 2, 'AVAILABLE'),
(8, 2, 4, '105', 1, 'AVAILABLE'),
(9, 2, 4, '106', 1, 'AVAILABLE'),
(10, 2, 4, '107', 1, 'AVAILABLE'),

-- Hotel 3 Rooms
(11, 3, 5, '1201', 12, 'AVAILABLE'),
(12, 3, 5, '1202', 12, 'AVAILABLE'),
(13, 3, 5, '1203', 12, 'AVAILABLE'),
(14, 3, 6, '1401', 14, 'AVAILABLE'),
(15, 3, 6, '1402', 14, 'AVAILABLE'),

-- Hotel 4 Rooms
(16, 4, 7, 'CH-1', 1, 'AVAILABLE'),
(17, 4, 7, 'CH-2', 1, 'AVAILABLE'),
(18, 4, 8, 'FS-1', 2, 'AVAILABLE'),
(19, 4, 8, 'FS-2', 2, 'AVAILABLE'),

-- Hotel 5 Rooms
(20, 5, 9, 'WC-01', 1, 'AVAILABLE'),
(21, 5, 9, 'WC-02', 1, 'AVAILABLE'),
(22, 5, 10, 'HB-01', 1, 'AVAILABLE'),
(23, 5, 10, 'HB-02', 1, 'AVAILABLE');

-- 6. INSERT SAMPLE BOOKINGS (Demonstrating Active & Cancelled States)
INSERT INTO booking (id, booking_reference, guest_name, guest_email, guest_phone, room_id, check_in_date, check_out_date, total_amount, status) VALUES
(1, 'SF-202611-1001', 'Arjun Sharma', 'arjun.sharma@example.com', '+91-9876543210', 1, '2026-12-15', '2026-12-18', 55500.00, 'CONFIRMED'),
(2, 'SF-202611-1002', 'Priya Patel', 'priya.patel@example.com', '+91-9812345678', 6, '2026-12-20', '2026-12-23', 37500.00, 'CONFIRMED'),
(3, 'SF-202611-1003', 'Rohan Mehta', 'rohan.mehta@example.com', '+91-9701234567', 11, '2026-11-25', '2026-11-27', 19000.00, 'CANCELLED');
