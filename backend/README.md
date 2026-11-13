# StayFinder Backend – Spring Boot REST API

The backend service for **StayFinder**, an editorial luxury hotel booking platform with guaranteed physical room allocation and concurrency protection.

---

## 🛠️ Tech Stack & Key Dependencies

- **Java 21 (LTS)**
- **Spring Boot 3.4.3**
  - `spring-boot-starter-web` (REST API & MVC)
  - `spring-boot-starter-data-jpa` (Spring Data JPA & Hibernate 6)
  - `spring-boot-starter-validation` (Jakarta Validation)
  - `spring-boot-starter-test` (JUnit 5, Mockito, AssertJ)
- **MySQL 8.4 (LTS)** via `mysql-connector-j`
- **Flyway Database Migrations** (`flyway-core`, `flyway-mysql`)
- **Springdoc OpenAPI 2.8.5** (Swagger UI at `/swagger-ui/index.html`)
- **HikariCP** connection pool
- **H2 in-memory database** for unit tests

---

## 🔒 Concurrency & Physical Room Allocation

StayFinder solves the physical room double-booking problem using **Pessimistic Write Locking (`SELECT ... FOR UPDATE`)**:
1. When a guest submits a reservation, the transaction enters `@Transactional(isolation = Isolation.READ_COMMITTED)`.
2. The service executes `roomRepository.findByIdWithLock(roomId)` acquiring an exclusive pessimistic write lock (`PESSIMISTIC_WRITE`) on the specific room row.
3. With the lock held, it evaluates overlapping active bookings using half-open intervals:
   `checkInDate < :requestedCheckOutDate AND checkOutDate > :requestedCheckInDate AND status <> 'CANCELLED'`.
4. If an overlap is detected, `RoomUnavailableException` is thrown and the transaction rolls back without creating duplicate bookings.
5. If free, the booking is persisted with status `CONFIRMED` and the lock is released upon commit.

---

## 📦 Database & Flyway Migrations

Database schema and seed data are managed strictly via Flyway migrations under `src/main/resources/db/migration/`:
- `V1__create_database_tables.sql`: Creates 6 normalized tables (`hotel`, `amenity`, `hotel_amenity`, `room_type`, `room`, `booking`) with constraints, foreign keys, and indexes.
- `V2__insert_sample_hotels.sql`: Seeds 5 curated luxury hotels, 10 room types, 25 physical rooms, and initial booking records.

---

## 🚀 Setup & Local Execution

### Prerequisites
- JDK 21+
- MySQL 8.4+ running locally on port 3306

### Environment Setup
Copy the sample environment file in the repository root:
```bash
cp .env.example .env
```
Configure your local database credentials in `.env` (the application automatically loads these via `DotenvEnvironmentPostProcessor`):
```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=stayfinder_db
DB_USERNAME=stayfinder_app
DB_PASSWORD=your_secure_password
```

### Running the Backend
```bash
# Using Maven wrapper
./mvnw spring-boot:run

# On Windows PowerShell
.\mvnw.cmd spring-boot:run
```
The server will start on `http://localhost:8080`.
- **Health Check:** `http://localhost:8080/api/v1/health`
- **Swagger UI:** `http://localhost:8080/swagger-ui/index.html`
- **OpenAPI JSON:** `http://localhost:8080/api-docs`

---

## 🧪 Testing

```bash
# Run complete test suite (46 tests: unit, slice, and integration)
.\mvnw.cmd test

# Run focused MySQL concurrency integration test
.\mvnw.cmd "-Dtest=BookingConcurrencyIntegrationTest" test

# Run database integration tests
.\mvnw.cmd "-Dtest=DatabaseIntegrationTest" test
```
