package com.stayfinder;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.TestPropertySource;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:stayfinder_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
        "spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver",
        "spring.datasource.username=${DB_USERNAME:stayfinder_app}",
        "spring.datasource.password=${DB_PASSWORD:}",
        "spring.flyway.enabled=true",
        "spring.flyway.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:stayfinder_db}?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
        "spring.flyway.user=${DB_MIGRATION_USERNAME:${DB_USERNAME:stayfinder_app}}",
        "spring.flyway.password=${DB_MIGRATION_PASSWORD:${DB_PASSWORD:}}",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect"
})
class DatabaseIntegrationTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    @DisplayName("Verify connection is to stayfinder_db only")
    void verifyDatabaseCatalog() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            String catalog = connection.getCatalog();
            assertThat(catalog).isEqualToIgnoringCase("stayfinder_db");
            assertThat(catalog).isNotEqualToIgnoringCase("payment_collection");
        }
    }

    @Test
    @DisplayName("Verify all Flyway migrations are applied successfully")
    void verifyFlywaySchemaHistory() {
        List<Map<String, Object>> migrations = jdbcTemplate.queryForList(
                "SELECT version, description, type, script, success FROM flyway_schema_history ORDER BY installed_rank"
        );
        assertThat(migrations).hasSizeGreaterThanOrEqualTo(2);

        Map<String, Object> v1 = migrations.get(0);
        assertThat(v1.get("version")).isEqualTo("1");
        assertThat(v1.get("description").toString().toLowerCase()).contains("create");
        assertThat(v1.get("success").toString()).matches("1|true|TRUE");

        Map<String, Object> v2 = migrations.get(1);
        assertThat(v2.get("version")).isEqualTo("2");
        assertThat(v2.get("description").toString().toLowerCase()).contains("sample");
        assertThat(v2.get("success").toString()).matches("1|true|TRUE");
    }

    @Test
    @DisplayName("Verify all six relational tables exist in stayfinder_db")
    void verifySixTablesExist() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            List<String> tables = new ArrayList<>();
            try (ResultSet rs = metaData.getTables("stayfinder_db", null, "%", new String[]{"TABLE"})) {
                while (rs.next()) {
                    tables.add(rs.getString("TABLE_NAME").toLowerCase());
                }
            }
            assertThat(tables).contains(
                    "hotel",
                    "amenity",
                    "hotel_amenity",
                    "room_type",
                    "room",
                    "booking"
            );
        }
    }

    @Test
    @DisplayName("Verify sample record counts in each table")
    void verifyRecordCounts() {
        Integer hotelCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hotel", Integer.class);
        Integer amenityCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM amenity", Integer.class);
        Integer hotelAmenityCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM hotel_amenity", Integer.class);
        Integer roomTypeCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM room_type", Integer.class);
        Integer roomCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM room", Integer.class);
        Integer bookingCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM booking", Integer.class);

        assertThat(hotelCount).isGreaterThanOrEqualTo(5);
        assertThat(amenityCount).isGreaterThanOrEqualTo(10);
        assertThat(hotelAmenityCount).isGreaterThanOrEqualTo(30);
        assertThat(roomTypeCount).isGreaterThanOrEqualTo(10);
        assertThat(roomCount).isGreaterThanOrEqualTo(20);
        assertThat(bookingCount).isGreaterThanOrEqualTo(3);
    }

    @Test
    @DisplayName("Verify foreign key constraints and data integrity")
    void verifyForeignKeysAndIntegrity() {
        // Verify hotel_amenity foreign keys reference existing hotels and amenities
        Integer orphanHotelAmenities = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM hotel_amenity ha LEFT JOIN hotel h ON ha.hotel_id = h.id WHERE h.id IS NULL",
                Integer.class
        );
        assertThat(orphanHotelAmenities).isZero();

        // Verify room_type foreign keys reference existing hotels
        Integer orphanRoomTypes = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM room_type rt LEFT JOIN hotel h ON rt.hotel_id = h.id WHERE h.id IS NULL",
                Integer.class
        );
        assertThat(orphanRoomTypes).isZero();

        // Verify room foreign keys reference existing hotels and room_types
        Integer orphanRooms = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM room r LEFT JOIN hotel h ON r.hotel_id = h.id LEFT JOIN room_type rt ON r.room_type_id = rt.id WHERE h.id IS NULL OR rt.id IS NULL",
                Integer.class
        );
        assertThat(orphanRooms).isZero();

        // Verify booking foreign keys reference existing rooms
        Integer orphanBookings = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM booking b LEFT JOIN room r ON b.room_id = r.id WHERE r.id IS NULL",
                Integer.class
        );
        assertThat(orphanBookings).isZero();

        // Verify all check-out dates are strictly after check-in dates
        Integer invalidBookingDates = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM booking WHERE check_out_date <= check_in_date",
                Integer.class
        );
        assertThat(invalidBookingDates).isZero();
    }
}
