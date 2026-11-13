package com.stayfinder.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads configuration from a root-level .env file into the Spring Environment.
 * Environment variables defined in the operating system take precedence over .env entries,
 * and .env entries take precedence over application.yml defaults.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        File envFile = findDotenvFile();
        if (envFile == null || !envFile.exists() || !envFile.isFile()) {
            return;
        }

        Map<String, Object> dotenvMap = parseDotenv(envFile);
        if (dotenvMap.isEmpty()) {
            return;
        }

        // Add with top precedence so project-local .env overrides unrelated global OS environment variables (e.g. system-level DB_USERNAME)
        environment.getPropertySources().addFirst(
                new MapPropertySource(PROPERTY_SOURCE_NAME, dotenvMap)
        );
    }

    private File findDotenvFile() {
        // 1. Current working directory
        File candidate = new File(".env");
        if (candidate.isFile()) {
            return candidate;
        }

        // 2. Parent directory (e.g., when executed from backend/ subfolder)
        candidate = new File("..", ".env");
        if (candidate.isFile()) {
            return candidate;
        }

        // 3. User directory check
        String userDir = System.getProperty("user.dir", ".");
        candidate = new File(userDir, ".env");
        if (candidate.isFile()) {
            return candidate;
        }
        candidate = new File(new File(userDir).getParentFile(), ".env");
        if (candidate.isFile()) {
            return candidate;
        }

        return null;
    }

    private Map<String, Object> parseDotenv(File envFile) {
        Map<String, Object> properties = new HashMap<>();
        try (BufferedReader reader = new BufferedReader(new FileReader(envFile, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIndex = line.indexOf('=');
                if (eqIndex <= 0) {
                    continue;
                }
                String key = line.substring(0, eqIndex).trim();
                String value = line.substring(eqIndex + 1).trim();

                // Remove surrounding single or double quotes
                if ((value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) ||
                    (value.startsWith("'") && value.endsWith("'") && value.length() >= 2)) {
                    value = value.substring(1, value.length() - 1);
                }

                properties.put(key, value);
            }
        } catch (IOException e) {
            // Gracefully ignore unreadable .env file
        }
        return properties;
    }
}
