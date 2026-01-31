package com.pilltrack.config;

import com.pilltrack.model.entity.*;
import com.pilltrack.model.enums.RoleType;
import com.pilltrack.model.enums.ShopStatus;
import com.pilltrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

/**
 * Demo data seeder for Pharmacy Finder feature
 * Creates 55+ pharmacies in Dhaka with location data and assigns 1000-2000 medicines to each
 * Special focus on areas near:
 * - Location 1: 23.7987, 90.4496 (Badda/Gulshan area)
 * - Location 2: 23.7600, 90.4300 (Rampura/Malibagh area)
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(2)
public class PharmacyDemoDataSeeder implements CommandLineRunner {

    private final MedicineShopRepository shopRepository;
    private final MedicineRepository medicineRepository;
    private final ShopMedicineRepository shopMedicineRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final MedicineManufacturerRepository manufacturerRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${app.seed-demo-data:false}")
    private boolean seedDemoData;

    private static final double PRIORITY_LAT_1 = 23.7987;
    private static final double PRIORITY_LNG_1 = 90.4496;
    private static final double PRIORITY_LAT_2 = 23.7600;
    private static final double PRIORITY_LNG_2 = 90.4300;
    
    private final Random random = new Random(42);

    @Override
    public void run(String... args) {
        try {
            if (!seedDemoData) {
                log.info("Demo data seeding is disabled (app.seed-demo-data=false)");
                return;
            }
            
            long shopCount = shopRepository.count();
            if (shopCount >= 50) {
                log.info("Demo pharmacy data already exists ({} shops), skipping seeding", shopCount);
                return;
            }
            
            log.info("Starting pharmacy demo data seeding...");
            
            List<User> shopOwners = createShopOwnerUsers();
            ensureMedicines();
            List<MedicineShop> pharmacies = createDemoPharmacies(shopOwners);
            assignMedicinesToPharmacies(pharmacies);
            
            log.info("Demo data seeding completed! Created {} pharmacies", pharmacies.size());
        } catch (Exception e) {
            log.error("Error during demo data seeding: {}", e.getMessage(), e);
        }
    }

    private List<User> createShopOwnerUsers() {
        List<User> owners = new ArrayList<>();
        
        try {
            Role shopOwnerRole = roleRepository.findByName(RoleType.SHOP_OWNER)
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(RoleType.SHOP_OWNER);
                        return roleRepository.save(role);
                    });

            for (int i = 1; i <= 60; i++) {
                final int index = i;
                String email = "pharmacy" + i + "@demo.pilltrack.com";
                
                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    owners.add(existingUser.get());
                } else {
                    User user = new User();
                    user.setName("Pharmacy Owner " + index);
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode("demo123"));
                    user.setRole(shopOwnerRole);
                    user.setIsActive(true);
                    user.setIsEmailVerified(true);
                    owners.add(userRepository.save(user));
                }
            }
            
            log.info("Created/found {} shop owner users", owners.size());
        } catch (Exception e) {
            log.error("Error creating shop owners: {}", e.getMessage());
        }
        
        return owners;
    }

    private void ensureMedicines() {
        try {
            long medicineCount = medicineRepository.count();
            if (medicineCount >= 2000) {
                log.info("Already have {} medicines in database", medicineCount);
                return;
            }

            log.info("Creating demo medicines (target: 2000+)...");
            
            List<MedicineManufacturer> manufacturers = createManufacturers();
            List<String[]> medicineData = getMedicineData();
            
            int count = 0;
            List<Medicine> batch = new ArrayList<>();
            
            for (String[] med : medicineData) {
                String brandName = med[0];
                String genericName = med[1];
                String dosageForm = med[2];
                String strength = med[3];
                
                String slug = generateSlug(brandName + "-" + strength + "-" + dosageForm);
                
                if (!medicineRepository.existsBySlug(slug)) {
                    Medicine medicine = new Medicine();
                    medicine.setBrandName(brandName);
                    medicine.setGenericName(genericName);
                    medicine.setDosageForm(dosageForm);
                    medicine.setStrength(strength);
                    medicine.setType("allopathic");
                    medicine.setSlug(slug);
                    medicine.setManufacturer(manufacturers.get(random.nextInt(manufacturers.size())));
                    medicine.setUnitPrice(BigDecimal.valueOf(5 + random.nextDouble() * 195).setScale(2, RoundingMode.HALF_UP));
                    medicine.setPackPrice(BigDecimal.valueOf(50 + random.nextDouble() * 950).setScale(2, RoundingMode.HALF_UP));
                    medicine.setIsActive(true);
                    
                    batch.add(medicine);
                    count++;
                    
                    if (batch.size() >= 100) {
                        medicineRepository.saveAll(batch);
                        batch.clear();
                        log.info("Saved {} medicines so far...", count);
                    }
                }
            }
            
            if (!batch.isEmpty()) {
                medicineRepository.saveAll(batch);
            }
            
            log.info("Created {} demo medicines", count);
        } catch (Exception e) {
            log.error("Error creating medicines: {}", e.getMessage());
        }
    }
    
    private List<MedicineManufacturer> createManufacturers() {
        List<MedicineManufacturer> manufacturers = new ArrayList<>();
        
        String[][] manufacturerData = {
            {"Square Pharmaceuticals", "square-pharmaceuticals", "Bangladesh"},
            {"Beximco Pharmaceuticals", "beximco-pharmaceuticals", "Bangladesh"},
            {"Incepta Pharmaceuticals", "incepta-pharmaceuticals", "Bangladesh"},
            {"Renata Limited", "renata-limited", "Bangladesh"},
            {"Opsonin Pharma", "opsonin-pharma", "Bangladesh"},
            {"ACI Limited", "aci-limited", "Bangladesh"},
            {"Eskayef Pharmaceuticals", "eskayef-pharmaceuticals", "Bangladesh"},
            {"Drug International", "drug-international", "Bangladesh"},
            {"Acme Laboratories", "acme-laboratories", "Bangladesh"},
            {"Healthcare Pharmaceuticals", "healthcare-pharmaceuticals", "Bangladesh"}
        };
        
        for (String[] data : manufacturerData) {
            try {
                MedicineManufacturer existing = manufacturerRepository.findBySlug(data[1]).orElse(null);
                if (existing != null) {
                    manufacturers.add(existing);
                } else {
                    MedicineManufacturer m = new MedicineManufacturer();
                    m.setName(data[0]);
                    m.setSlug(data[1]);
                    m.setCountry(data[2]);
                    m.setIsActive(true);
                    manufacturers.add(manufacturerRepository.save(m));
                }
            } catch (Exception e) {
                log.warn("Error creating manufacturer {}: {}", data[0], e.getMessage());
            }
        }
        
        return manufacturers;
    }

    private List<MedicineShop> createDemoPharmacies(List<User> owners) {
        List<MedicineShop> pharmacies = new ArrayList<>();
        
        if (owners.isEmpty()) {
            log.error("No shop owners available");
            return pharmacies;
        }
        
        int ownerIndex = 0;
        
        // PRIORITY AREA 1: Near 23.7987, 90.4496 (Badda/Gulshan)
        log.info("Creating pharmacies near priority location 1: ({}, {})", PRIORITY_LAT_1, PRIORITY_LNG_1);
        String[] priorityNames1 = {
            "Gulshan Care Pharmacy", "Badda Health Point", "North Badda Medicine House",
            "Gulshan-2 Pharmacy", "Merul Badda Drug Store", "DIT Road Pharma",
            "Natun Bazar Medical", "Gulshan Circle Pharmacy", "Badda Link Road Medicine",
            "Pragati Sarani Pharmacy", "Rampura DIT Pharma", "Hatirjheel View Medical"
        };
        
        for (int i = 0; i < 12 && ownerIndex < owners.size(); i++) {
            double latOffset = (random.nextDouble() - 0.5) * 0.015;
            double lngOffset = (random.nextDouble() - 0.5) * 0.015;
            
            MedicineShop shop = createPharmacy(
                priorityNames1[i],
                owners.get(ownerIndex++),
                PRIORITY_LAT_1 + latOffset,
                PRIORITY_LNG_1 + lngOffset,
                "Badda",
                "Ward 21"
            );
            if (shop != null) pharmacies.add(shop);
        }
        
        // PRIORITY AREA 2: Near 23.7600, 90.4300 (Rampura/Malibagh)
        log.info("Creating pharmacies near priority location 2: ({}, {})", PRIORITY_LAT_2, PRIORITY_LNG_2);
        String[] priorityNames2 = {
            "Malibagh Central Pharmacy", "Rampura Plus Medical", "Mouchak Pharmacy",
            "Malibagh Chowdhury Para Medicine", "Rampura TV Road Pharma", "DIT Extension Medical",
            "Shahjahanpur Pharmacy", "Malibagh Rail Gate Drug Store", "East Rampura Health Point",
            "Mouchak More Medical", "Khilbarirtek Pharmacy", "Banasree Gate Pharma"
        };
        
        for (int i = 0; i < 12 && ownerIndex < owners.size(); i++) {
            double latOffset = (random.nextDouble() - 0.5) * 0.015;
            double lngOffset = (random.nextDouble() - 0.5) * 0.015;
            
            MedicineShop shop = createPharmacy(
                priorityNames2[i],
                owners.get(ownerIndex++),
                PRIORITY_LAT_2 + latOffset,
                PRIORITY_LNG_2 + lngOffset,
                "Rampura",
                "Ward 22"
            );
            if (shop != null) pharmacies.add(shop);
        }
        
        // Other Dhaka areas
        DhakaArea[] areas = getDhakaAreas();
        
        for (DhakaArea area : areas) {
            for (int i = 0; i < area.pharmacyCount && ownerIndex < owners.size(); i++) {
                double latOffset = (random.nextDouble() - 0.5) * 0.02;
                double lngOffset = (random.nextDouble() - 0.5) * 0.02;
                
                String pharmacyName = generatePharmacyName(area.name, i + 1);
                
                MedicineShop shop = createPharmacy(
                    pharmacyName,
                    owners.get(ownerIndex++),
                    area.latitude + latOffset,
                    area.longitude + lngOffset,
                    area.name,
                    area.ward
                );
                if (shop != null) pharmacies.add(shop);
            }
        }
        
        log.info("Created {} demo pharmacies total", pharmacies.size());
        return pharmacies;
    }
    
    private MedicineShop createPharmacy(String name, User owner, double lat, double lng, String area, String ward) {
        try {
            String slug = generateSlug(name);
            
            if (shopRepository.existsBySlug(slug)) {
                return shopRepository.findBySlug(slug).orElse(null);
            }
            
            MedicineShop shop = MedicineShop.builder()
                    .name(name)
                    .slug(slug)
                    .description("Quality pharmacy in " + area + " area, Dhaka. Open 24/7 with home delivery.")
                    .owner(owner)
                    .email("contact@" + slug.replace(" ", "") + ".com")
                    .phone("+880" + (1700000000L + random.nextInt(99999999)))
                    .address("House " + (1 + random.nextInt(500)) + ", Road " + (1 + random.nextInt(30)) + ", " + area + ", Dhaka")
                    .city("Dhaka")
                    .area(area)
                    .ward(ward)
                    .postalCode(String.valueOf(1200 + random.nextInt(100)))
                    .country("Bangladesh")
                    .latitude(lat)
                    .longitude(lng)
                    .status(ShopStatus.VERIFIED)
                    .isVerified(true)
                    .isActive(true)
                    .rating(3.5 + random.nextDouble() * 1.5)
                    .ratingCount(10 + random.nextInt(200))
                    .totalProducts(0)
                    .totalOrders(random.nextInt(500))
                    .build();
            
            return shopRepository.save(shop);
        } catch (Exception e) {
            log.error("Error creating pharmacy {}: {}", name, e.getMessage());
            return null;
        }
    }

    private void assignMedicinesToPharmacies(List<MedicineShop> pharmacies) {
        try {
            List<Medicine> allMedicines = medicineRepository.findAll();
            if (allMedicines.isEmpty()) {
                log.warn("No medicines available to assign to pharmacies");
                return;
            }
            
            int totalMedicines = allMedicines.size();
            log.info("Assigning medicines from {} available medicines to {} pharmacies", 
                    totalMedicines, pharmacies.size());
            
            int pharmacyNumber = 0;
            for (MedicineShop pharmacy : pharmacies) {
                pharmacyNumber++;
                
                try {
                    // Each pharmacy gets 1000-2000 medicines (or all if less available)
                    int targetCount = Math.min(1000 + random.nextInt(1001), totalMedicines);
                    
                    List<Medicine> shuffled = new ArrayList<>(allMedicines);
                    Collections.shuffle(shuffled, random);
                    
                    List<ShopMedicine> batch = new ArrayList<>();
                    int assignedCount = 0;
                    
                    for (int i = 0; i < targetCount; i++) {
                        Medicine medicine = shuffled.get(i);
                        
                        BigDecimal basePrice = medicine.getUnitPrice() != null 
                                ? medicine.getUnitPrice() 
                                : BigDecimal.valueOf(10 + random.nextDouble() * 90);
                        
                        BigDecimal shopPrice = basePrice.multiply(BigDecimal.valueOf(0.9 + random.nextDouble() * 0.2))
                                .setScale(2, RoundingMode.HALF_UP);
                        
                        BigDecimal discountPrice = null;
                        int discountPercent = 0;
                        if (random.nextDouble() < 0.3) {
                            discountPercent = 5 + random.nextInt(20);
                            discountPrice = shopPrice.multiply(BigDecimal.valueOf(1 - discountPercent / 100.0))
                                    .setScale(2, RoundingMode.HALF_UP);
                        }
                        
                        ShopMedicine shopMedicine = ShopMedicine.builder()
                                .shop(pharmacy)
                                .medicine(medicine)
                                .price(shopPrice)
                                .discountPrice(discountPrice)
                                .discountPercent(discountPercent)
                                .stockQuantity(10 + random.nextInt(490))
                                .minStockAlert(10)
                                .batchNumber("BATCH-" + random.nextInt(99999))
                                .expiryDate(LocalDate.now().plusMonths(6 + random.nextInt(24)))
                                .isAvailable(true)
                                .isFeatured(random.nextDouble() < 0.05)
                                .soldCount(random.nextInt(100))
                                .build();
                        
                        batch.add(shopMedicine);
                        assignedCount++;
                        
                        if (batch.size() >= 500) {
                            shopMedicineRepository.saveAll(batch);
                            batch.clear();
                        }
                    }
                    
                    if (!batch.isEmpty()) {
                        shopMedicineRepository.saveAll(batch);
                    }
                    
                    pharmacy.setTotalProducts(assignedCount);
                    shopRepository.save(pharmacy);
                    
                    log.info("Pharmacy {}/{} '{}': assigned {} medicines", 
                            pharmacyNumber, pharmacies.size(), pharmacy.getName(), assignedCount);
                    
                } catch (Exception e) {
                    log.error("Error assigning medicines to pharmacy {}: {}", pharmacy.getName(), e.getMessage());
                }
            }
            
            log.info("Finished assigning medicines to all pharmacies");
        } catch (Exception e) {
            log.error("Error in assignMedicinesToPharmacies: {}", e.getMessage());
        }
    }

    private String generatePharmacyName(String area, int index) {
        String[] prefixes = {"City", "Care", "Health", "Life", "Royal", "Modern", "Prime", "Best", "Star", "Green", "Trust", "Family", "Plus", "Express"};
        String[] suffixes = {"Pharmacy", "Pharma", "Medicine", "Drug Store", "Medical", "Health Care", "Medicine House"};
        
        String prefix = prefixes[random.nextInt(prefixes.length)];
        String suffix = suffixes[random.nextInt(suffixes.length)];
        String areaShort = area.split(" ")[0];
        
        return prefix + " " + areaShort + " " + suffix;
    }

    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }

    private DhakaArea[] getDhakaAreas() {
        return new DhakaArea[]{
                new DhakaArea("Dhanmondi", "Ward 49", 23.7461, 90.3742, 3),
                new DhakaArea("Gulshan", "Ward 19", 23.7925, 90.4078, 3),
                new DhakaArea("Banani", "Ward 19", 23.7937, 90.4066, 2),
                new DhakaArea("Uttara", "Ward 1", 23.8759, 90.3795, 3),
                new DhakaArea("Mirpur", "Ward 2", 23.8223, 90.3654, 3),
                new DhakaArea("Mohammadpur", "Ward 45", 23.7662, 90.3589, 2),
                new DhakaArea("Bashundhara", "Ward 18", 23.8193, 90.4345, 3),
                new DhakaArea("Motijheel", "Ward 34", 23.7332, 90.4185, 2),
                new DhakaArea("Farmgate", "Ward 47", 23.7578, 90.3870, 2),
                new DhakaArea("Tejgaon", "Ward 24", 23.7644, 90.3978, 2),
                new DhakaArea("Lalmatia", "Ward 49", 23.7540, 90.3700, 2),
                new DhakaArea("Shantinagar", "Ward 36", 23.7383, 90.4100, 2),
                new DhakaArea("Khilgaon", "Ward 23", 23.7480, 90.4340, 2),
                new DhakaArea("Banasree", "Ward 23", 23.7620, 90.4420, 2),
                new DhakaArea("Mogbazar", "Ward 33", 23.7500, 90.4050, 2)
        };
    }

    private List<String[]> getMedicineData() {
        List<String[]> medicines = new ArrayList<>();
        
        // Pain relievers
        addCategory(medicines, 
            new String[]{"Napa", "Ace", "Panadol", "Tylenol", "Reset", "Pyrenol", "Xpa", "Fast"},
            new String[]{"Paracetamol"},
            new String[]{"Tablet", "Syrup", "Suppository"},
            new String[]{"250mg", "500mg", "650mg", "120mg/5ml"});
        
        addCategory(medicines,
            new String[]{"Ibufen", "Brufen", "Advil", "Nurofen", "Profen", "Ibu"},
            new String[]{"Ibuprofen"},
            new String[]{"Tablet", "Syrup", "Gel"},
            new String[]{"200mg", "400mg", "600mg"});
        
        addCategory(medicines,
            new String[]{"Diclofex", "Voltalin", "Clofenac", "Diclo", "Inflanac"},
            new String[]{"Diclofenac"},
            new String[]{"Tablet", "Gel", "Injection"},
            new String[]{"25mg", "50mg", "75mg", "100mg"});
        
        // Antibiotics
        addCategory(medicines,
            new String[]{"Moxacil", "Amoxil", "Tycil", "Fimoxyl", "Moxapen"},
            new String[]{"Amoxicillin"},
            new String[]{"Capsule", "Syrup", "Tablet"},
            new String[]{"250mg", "500mg", "125mg/5ml"});
        
        addCategory(medicines,
            new String[]{"Azith", "Zithromax", "Azithral", "Zimax", "Azee"},
            new String[]{"Azithromycin"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"250mg", "500mg", "200mg/5ml"});
        
        addCategory(medicines,
            new String[]{"Ciprox", "Cipro", "Ciproflox", "Ciplox", "Ciprobid"},
            new String[]{"Ciprofloxacin"},
            new String[]{"Tablet", "Injection"},
            new String[]{"250mg", "500mg", "750mg"});
        
        addCategory(medicines,
            new String[]{"Cef-3", "Cefim", "Cefimax", "Cefixime", "Suprax"},
            new String[]{"Cefixime"},
            new String[]{"Capsule", "Tablet", "Syrup"},
            new String[]{"200mg", "400mg", "100mg/5ml"});
        
        addCategory(medicines,
            new String[]{"Levox", "Tavanic", "Levoflox", "Levaquin", "Levo"},
            new String[]{"Levofloxacin"},
            new String[]{"Tablet", "Injection"},
            new String[]{"250mg", "500mg", "750mg"});
        
        addCategory(medicines,
            new String[]{"Flagyl", "Metron", "Filmet", "Metrogyl", "Metrozol"},
            new String[]{"Metronidazole"},
            new String[]{"Tablet", "Syrup", "Injection"},
            new String[]{"200mg", "400mg", "500mg"});
        
        addCategory(medicines,
            new String[]{"Doxy", "Doxylin", "Doxycap", "Vibramycin"},
            new String[]{"Doxycycline"},
            new String[]{"Capsule", "Tablet"},
            new String[]{"50mg", "100mg"});
        
        // Antacids & GI
        addCategory(medicines,
            new String[]{"Losectil", "Seclo", "Omep", "Prilosec", "Lomac"},
            new String[]{"Omeprazole"},
            new String[]{"Capsule"},
            new String[]{"20mg", "40mg"});
        
        addCategory(medicines,
            new String[]{"Nexium", "Maxpro", "Esomep", "Nexpro", "Esoz"},
            new String[]{"Esomeprazole"},
            new String[]{"Capsule", "Tablet", "Injection"},
            new String[]{"20mg", "40mg"});
        
        addCategory(medicines,
            new String[]{"Pantonix", "Pantocid", "Pantop", "Protonix"},
            new String[]{"Pantoprazole"},
            new String[]{"Tablet", "Injection"},
            new String[]{"20mg", "40mg"});
        
        addCategory(medicines,
            new String[]{"Ranitid", "Zantac", "Ranix", "Rani"},
            new String[]{"Ranitidine"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"150mg", "300mg"});
        
        // Cardiovascular
        addCategory(medicines,
            new String[]{"Amdocal", "Norvasc", "Amlo", "Amlodac", "Stamlo"},
            new String[]{"Amlodipine"},
            new String[]{"Tablet"},
            new String[]{"2.5mg", "5mg", "10mg"});
        
        addCategory(medicines,
            new String[]{"Tenolol", "Atenol", "Tenormin", "Atpure"},
            new String[]{"Atenolol"},
            new String[]{"Tablet"},
            new String[]{"25mg", "50mg", "100mg"});
        
        addCategory(medicines,
            new String[]{"Losar", "Cozaar", "Losartan", "Repace"},
            new String[]{"Losartan"},
            new String[]{"Tablet"},
            new String[]{"25mg", "50mg", "100mg"});
        
        addCategory(medicines,
            new String[]{"Metolol", "Betaloc", "Lopressor", "Metolar"},
            new String[]{"Metoprolol"},
            new String[]{"Tablet"},
            new String[]{"25mg", "50mg", "100mg"});
        
        addCategory(medicines,
            new String[]{"Lisoril", "Zestril", "Prinivil", "Listril"},
            new String[]{"Lisinopril"},
            new String[]{"Tablet"},
            new String[]{"5mg", "10mg", "20mg"});
        
        addCategory(medicines,
            new String[]{"Ecosprin", "Disprin", "Aspirin", "Loprin"},
            new String[]{"Aspirin"},
            new String[]{"Tablet"},
            new String[]{"75mg", "150mg", "300mg"});
        
        // Diabetes
        addCategory(medicines,
            new String[]{"Glucophage", "Metforal", "Glycomet", "Obimet", "Metformin"},
            new String[]{"Metformin"},
            new String[]{"Tablet"},
            new String[]{"500mg", "850mg", "1000mg"});
        
        addCategory(medicines,
            new String[]{"Amaryl", "Glimestar", "Glimy", "Glimer"},
            new String[]{"Glimepiride"},
            new String[]{"Tablet"},
            new String[]{"1mg", "2mg", "3mg", "4mg"});
        
        addCategory(medicines,
            new String[]{"Glizid", "Diamicron", "Glycron", "Gliclazide"},
            new String[]{"Gliclazide"},
            new String[]{"Tablet"},
            new String[]{"40mg", "80mg"});
        
        addCategory(medicines,
            new String[]{"Januvia", "Sitaglu", "Istavel", "Zita"},
            new String[]{"Sitagliptin"},
            new String[]{"Tablet"},
            new String[]{"25mg", "50mg", "100mg"});
        
        // Vitamins
        addCategory(medicines,
            new String[]{"Ceevit", "C-Vit", "Limcee", "Celin", "Cevit"},
            new String[]{"Vitamin C"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"250mg", "500mg", "1000mg"});
        
        addCategory(medicines,
            new String[]{"D-Rise", "Sunny-D", "D3-Max", "Calcirol"},
            new String[]{"Vitamin D3"},
            new String[]{"Tablet", "Capsule", "Drop"},
            new String[]{"1000IU", "2000IU", "60000IU"});
        
        addCategory(medicines,
            new String[]{"Becosules", "B-Complex", "Neurobion", "Becadex"},
            new String[]{"Vitamin B Complex"},
            new String[]{"Tablet", "Capsule", "Injection"},
            new String[]{"Standard"});
        
        addCategory(medicines,
            new String[]{"Centrum", "Supradyn", "Multivit", "A-Z"},
            new String[]{"Multivitamin"},
            new String[]{"Tablet", "Capsule", "Syrup"},
            new String[]{"Standard"});
        
        addCategory(medicines,
            new String[]{"Calbo-D", "Shelcal", "Caltrate", "Calcium-D"},
            new String[]{"Calcium + Vitamin D"},
            new String[]{"Tablet"},
            new String[]{"500mg", "1000mg"});
        
        addCategory(medicines,
            new String[]{"Feroglobin", "Fefol", "Ferosul", "Hemoglobin"},
            new String[]{"Iron"},
            new String[]{"Tablet", "Syrup", "Capsule"},
            new String[]{"100mg", "150mg"});
        
        addCategory(medicines,
            new String[]{"Zincovit", "Zincat", "Zinc", "Zinconia"},
            new String[]{"Zinc"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"20mg", "50mg"});
        
        addCategory(medicines,
            new String[]{"Folvite", "Folic", "Folinext"},
            new String[]{"Folic Acid"},
            new String[]{"Tablet"},
            new String[]{"1mg", "5mg"});
        
        // Antihistamines
        addCategory(medicines,
            new String[]{"Cetzine", "Zyrtec", "Cetiriz", "Alerid"},
            new String[]{"Cetirizine"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"5mg", "10mg"});
        
        addCategory(medicines,
            new String[]{"Clarityn", "Loratin", "Loratadine", "Alavert"},
            new String[]{"Loratadine"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"10mg"});
        
        addCategory(medicines,
            new String[]{"Fexo", "Allegra", "Fexofen", "Telfast"},
            new String[]{"Fexofenadine"},
            new String[]{"Tablet"},
            new String[]{"60mg", "120mg", "180mg"});
        
        addCategory(medicines,
            new String[]{"Histacin", "Piriton", "CTM", "Chlorphen"},
            new String[]{"Chlorpheniramine"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"4mg"});
        
        // Respiratory
        addCategory(medicines,
            new String[]{"Ventolin", "Asthalin", "Salbutamol", "Proair"},
            new String[]{"Salbutamol"},
            new String[]{"Tablet", "Syrup", "Inhaler"},
            new String[]{"2mg", "4mg", "100mcg"});
        
        addCategory(medicines,
            new String[]{"Montair", "Singulair", "Montek", "Monte"},
            new String[]{"Montelukast"},
            new String[]{"Tablet", "Chewable"},
            new String[]{"4mg", "5mg", "10mg"});
        
        addCategory(medicines,
            new String[]{"Budecort", "Pulmicort", "Budesonide"},
            new String[]{"Budesonide"},
            new String[]{"Inhaler", "Nebulizer"},
            new String[]{"100mcg", "200mcg", "400mcg"});
        
        // Cough & Cold
        addCategory(medicines,
            new String[]{"Dextro", "Delsym", "Robitussin", "Tussin"},
            new String[]{"Dextromethorphan"},
            new String[]{"Syrup"},
            new String[]{"15mg/5ml", "30mg/5ml"});
        
        addCategory(medicines,
            new String[]{"Bromhex", "Bisolvon", "Bromo"},
            new String[]{"Bromhexine"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"8mg", "4mg/5ml"});
        
        addCategory(medicines,
            new String[]{"Ambrodil", "Mucosolvan", "Ambrolite"},
            new String[]{"Ambroxol"},
            new String[]{"Tablet", "Syrup"},
            new String[]{"30mg", "15mg/5ml"});
        
        // Antifungals
        addCategory(medicines,
            new String[]{"Fluka", "Diflucan", "Fluconazole", "Forcan"},
            new String[]{"Fluconazole"},
            new String[]{"Tablet", "Capsule"},
            new String[]{"50mg", "100mg", "150mg", "200mg"});
        
        addCategory(medicines,
            new String[]{"Itral", "Sporanox", "Canditral"},
            new String[]{"Itraconazole"},
            new String[]{"Capsule"},
            new String[]{"100mg", "200mg"});
        
        addCategory(medicines,
            new String[]{"Nizoral", "Ketoconazole", "Ketoskin"},
            new String[]{"Ketoconazole"},
            new String[]{"Tablet", "Cream", "Shampoo"},
            new String[]{"200mg", "2%"});
        
        addCategory(medicines,
            new String[]{"Canesten", "Clotrim", "Candid"},
            new String[]{"Clotrimazole"},
            new String[]{"Cream", "Powder", "Pessary"},
            new String[]{"1%", "100mg"});
        
        // CNS
        addCategory(medicines,
            new String[]{"Serenata", "Zoloft", "Serta", "Sertraline"},
            new String[]{"Sertraline"},
            new String[]{"Tablet"},
            new String[]{"25mg", "50mg", "100mg"});
        
        addCategory(medicines,
            new String[]{"Fludac", "Prozac", "Fluox", "Fluoxetine"},
            new String[]{"Fluoxetine"},
            new String[]{"Capsule"},
            new String[]{"10mg", "20mg", "40mg"});
        
        addCategory(medicines,
            new String[]{"Nexito", "Lexapro", "Escitalopram", "Stalopam"},
            new String[]{"Escitalopram"},
            new String[]{"Tablet"},
            new String[]{"5mg", "10mg", "20mg"});
        
        addCategory(medicines,
            new String[]{"Trika", "Xanax", "Alprazolam", "Alprax"},
            new String[]{"Alprazolam"},
            new String[]{"Tablet"},
            new String[]{"0.25mg", "0.5mg", "1mg"});
        
        addCategory(medicines,
            new String[]{"Rivotril", "Klonopin", "Clonazepam", "Clonotril"},
            new String[]{"Clonazepam"},
            new String[]{"Tablet"},
            new String[]{"0.25mg", "0.5mg", "1mg", "2mg"});
        
        // Muscle Relaxants
        addCategory(medicines,
            new String[]{"Myoril", "Thiocol", "Eperisone"},
            new String[]{"Eperisone"},
            new String[]{"Tablet"},
            new String[]{"50mg"});
        
        addCategory(medicines,
            new String[]{"Flexon", "Tizanidine", "Sirdalud"},
            new String[]{"Tizanidine"},
            new String[]{"Tablet"},
            new String[]{"2mg", "4mg"});
        
        // Eye/Ear
        addCategory(medicines,
            new String[]{"Ciplox-D", "Oflox", "Zenflox"},
            new String[]{"Ofloxacin"},
            new String[]{"Eye Drop", "Ear Drop"},
            new String[]{"0.3%"});
        
        addCategory(medicines,
            new String[]{"Refresh", "Tears", "Systane"},
            new String[]{"Artificial Tears"},
            new String[]{"Eye Drop"},
            new String[]{"0.5%", "1%"});
        
        // Skin
        addCategory(medicines,
            new String[]{"Betnovate", "Betaderm", "Betamethasone"},
            new String[]{"Betamethasone"},
            new String[]{"Cream", "Ointment", "Lotion"},
            new String[]{"0.1%", "0.05%"});
        
        addCategory(medicines,
            new String[]{"Panderm", "Quadriderm", "Triderm"},
            new String[]{"Clobetasol + Miconazole + Gentamicin"},
            new String[]{"Cream"},
            new String[]{"Standard"});
        
        addCategory(medicines,
            new String[]{"Fucidin", "Fusidic"},
            new String[]{"Fusidic Acid"},
            new String[]{"Cream", "Ointment"},
            new String[]{"2%"});
        
        // Fill to 2000+
        String[] extras = {"Alpha", "Beta", "Gamma", "Delta", "Omega", "Plus", "Max", "Ultra", "Pro", "Neo"};
        String[] forms = {"Tablet", "Capsule", "Syrup"};
        
        int counter = 1;
        while (medicines.size() < 2200) {
            String brand = extras[random.nextInt(extras.length)] + "-" + counter;
            String generic = "Herbal Complex";
            String form = forms[random.nextInt(forms.length)];
            String strength = (50 + random.nextInt(450)) + "mg";
            medicines.add(new String[]{brand, generic, form, strength});
            counter++;
        }
        
        log.info("Generated {} medicine entries", medicines.size());
        return medicines;
    }
    
    private void addCategory(List<String[]> medicines, String[] brands, String[] generics, 
                             String[] forms, String[] strengths) {
        for (String brand : brands) {
            String generic = generics[random.nextInt(generics.length)];
            for (String form : forms) {
                for (String strength : strengths) {
                    medicines.add(new String[]{brand, generic, form, strength});
                }
            }
        }
    }

    private static class DhakaArea {
        String name;
        String ward;
        double latitude;
        double longitude;
        int pharmacyCount;

        DhakaArea(String name, String ward, double latitude, double longitude, int pharmacyCount) {
            this.name = name;
            this.ward = ward;
            this.latitude = latitude;
            this.longitude = longitude;
            this.pharmacyCount = pharmacyCount;
        }
    }
}
