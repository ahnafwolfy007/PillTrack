package com.pilltrack.config;

import com.pilltrack.model.entity.Medicine;
import com.pilltrack.model.entity.MedicineManufacturer;
import com.pilltrack.repository.MedicineManufacturerRepository;
import com.pilltrack.repository.MedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Run early so other seeders can use medicines if needed
public class MedicineCsvSeeder implements CommandLineRunner {

    private static final int MAX_ROWS = 500; // keep local seeding fast

    private final MedicineRepository medicineRepository;
    private final MedicineManufacturerRepository manufacturerRepository;

    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    @Value("${spring.profiles.active:}")
    private String activeProfiles;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedDemoData) {
            log.info("Medicine CSV seeding is disabled (app.seed-demo-data=false)");
            return;
        }

        if (!isLocalProfile()) {
            log.info("Skipping medicine CSV seeding for non-local profile: {}", activeProfiles);
            return;
        }

        if (medicineRepository.count() > 0) {
            log.info("Medicines already present ({} rows), skipping CSV import", medicineRepository.count());
            return;
        }

        Path csvPath = Path.of("..", "med_DB", "medicine.csv").toAbsolutePath().normalize();
        if (!Files.exists(csvPath)) {
            log.warn("Medicine CSV not found at {}. Skipping seed.", csvPath);
            return;
        }

        log.info("Seeding medicines from {} (max {} rows)...", csvPath, MAX_ROWS);

        Map<String, MedicineManufacturer> manufacturerCache = new HashMap<>();
        List<Medicine> batch = new ArrayList<>();

        try (var lines = Files.lines(csvPath)) {
            lines
                    .skip(1) // header
                    .limit(MAX_ROWS)
                    .forEach(line -> {
                        String[] cols = line.split(",", -1);
                        if (cols.length < 7) {
                            return;
                        }

                        try {
                            Integer brandId = parseIntSafe(cols[0]);
                            String brandName = cols[1].trim();
                            String type = cols[2].trim();
                            String slug = cols[3].trim();
                            String dosageForm = cols[4].trim();
                            String generic = cols[5].trim();
                            String strength = cols[6].trim();
                            String manufacturerName = cols.length > 7 ? cols[7].trim() : null;
                            String unitQuantity = cols.length > 8 ? cols[8].trim() : null;
                            String containerType = cols.length > 9 ? cols[9].trim() : null;
                            BigDecimal unitPrice = cols.length > 10 ? parseBigDecimal(cols[10]) : null;
                            BigDecimal packQuantity = cols.length > 11 ? parseBigDecimal(cols[11]) : null;
                            BigDecimal packPrice = cols.length > 12 ? parseBigDecimal(cols[12]) : null;

                            if (brandName.isEmpty()) {
                                return;
                            }

                            MedicineManufacturer manufacturer = null;
                            if (manufacturerName != null && !manufacturerName.isEmpty()) {
                                manufacturer = manufacturerCache.computeIfAbsent(manufacturerName, name -> {
                                    return manufacturerRepository.findByName(name)
                                            .orElseGet(() -> manufacturerRepository.save(
                                                    MedicineManufacturer.builder()
                                                            .name(name)
                                                            .slug(slugify(name))
                                                            .isActive(true)
                                                            .build()
                                            ));
                                });
                            }

                            Medicine medicine = Medicine.builder()
                                    .brandId(brandId)
                                    .brandName(brandName)
                                    .type(type)
                                    .slug(slug.isEmpty() ? slugify(brandName) : slug)
                                    .dosageForm(dosageForm)
                                    .genericName(generic)
                                    .strength(strength)
                                    .manufacturer(manufacturer)
                                    .unitQuantity(unitQuantity)
                                    .containerType(containerType)
                                    .unitPrice(unitPrice)
                                    .packQuantity(packQuantity)
                                    .packPrice(packPrice)
                                    .isActive(true)
                                    .build();

                            batch.add(medicine);
                        } catch (Exception ex) {
                            log.debug("Skipping malformed medicine row: {}", line, ex);
                        }
                    });
        } catch (Exception e) {
            log.error("Failed reading medicine CSV: {}", e.getMessage(), e);
            return;
        }

        if (batch.isEmpty()) {
            log.warn("No medicines parsed from CSV; nothing to seed.");
            return;
        }

        medicineRepository.saveAll(batch);
        log.info("Seeded {} medicines from CSV", batch.size());
    }

    private boolean isLocalProfile() {
        return activeProfiles != null && activeProfiles.toLowerCase(Locale.ROOT).contains("local");
    }

    private Integer parseIntSafe(String value) {
        try {
            return Integer.parseInt(value.trim());
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal parseBigDecimal(String value) {
        try {
            String v = value.trim();
            if (v.isEmpty()) {
                return null;
            }
            return new BigDecimal(v);
        } catch (Exception e) {
            return null;
        }
    }

    private String slugify(String input) {
        if (input == null || input.isBlank()) {
            return null;
        }
        String slug = input.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isEmpty() ? null : slug;
    }
}
