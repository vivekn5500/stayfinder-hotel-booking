package com.stayfinder;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

@SpringBootTest
class StayFinderApplicationTests {

    @Test
    @DisplayName("Application context loads successfully")
    void contextLoads() {
        assertDoesNotThrow(() -> {
            // Context successfully initialized
        });
    }
}
