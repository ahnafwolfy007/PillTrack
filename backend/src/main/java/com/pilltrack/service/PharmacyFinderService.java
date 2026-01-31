package com.pilltrack.service;

import com.pilltrack.dto.request.PharmacySearchRequest;
import com.pilltrack.dto.response.NearestPharmacyResponse;
import com.pilltrack.dto.response.PharmacyLocationResponse;
import com.pilltrack.dto.response.PharmacySearchResponse;
import com.pilltrack.model.entity.MedicineShop;
import com.pilltrack.model.entity.ShopMedicine;
import com.pilltrack.repository.MedicineShopRepository;
import com.pilltrack.repository.ShopMedicineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PharmacyFinderService {
    
    private final MedicineShopRepository shopRepository;
    private final ShopMedicineRepository shopMedicineRepository;
    
    // Earth's radius in kilometers
    private static final double EARTH_RADIUS_KM = 6371.0;
    
    /**
     * Find pharmacies with a specific medicine, sorted by distance from user
     */
    public NearestPharmacyResponse findNearestPharmacyWithMedicine(PharmacySearchRequest request) {
        log.info("Searching for medicine '{}' near location ({}, {})", 
                request.getMedicineName(), request.getUserLatitude(), request.getUserLongitude());
        
        // Find all shop medicines matching the search term
        List<ShopMedicine> matchingShopMedicines = shopMedicineRepository
                .findByMedicineNameWithShopLocation(request.getMedicineName());
        
        log.info("Found {} matching shop-medicine entries", matchingShopMedicines.size());
        
        // Calculate distances and create response objects
        List<PharmacySearchResponse> results = matchingShopMedicines.stream()
                .map(sm -> createSearchResponse(sm, request.getUserLatitude(), request.getUserLongitude()))
                .filter(r -> r.getDistanceKm() <= request.getMaxRadiusKm())
                .sorted(Comparator.comparing(PharmacySearchResponse::getDistanceKm))
                .limit(request.getMaxResults())
                .collect(Collectors.toList());
        
        log.info("Returning {} results within {}km radius", results.size(), request.getMaxRadiusKm());
        
        return NearestPharmacyResponse.builder()
                .searchedMedicine(request.getMedicineName())
                .userLatitude(request.getUserLatitude())
                .userLongitude(request.getUserLongitude())
                .nearestPharmacy(results.isEmpty() ? null : results.get(0))
                .allResults(results)
                .totalFound(results.size())
                .searchRadiusKm(request.getMaxRadiusKm())
                .build();
    }
    
    /**
     * Get all pharmacies with their locations for map display
     */
    public List<PharmacyLocationResponse> getAllPharmacyLocations() {
        List<MedicineShop> shops = shopRepository.findAllWithLocation();
        
        return shops.stream()
                .map(this::createLocationResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get pharmacies near a specific location
     */
    public List<PharmacyLocationResponse> getPharmaciesNearLocation(Double latitude, Double longitude, Double radiusKm) {
        List<MedicineShop> allShops = shopRepository.findAllWithLocation();
        
        return allShops.stream()
                .map(shop -> {
                    double distance = calculateDistance(latitude, longitude, shop.getLatitude(), shop.getLongitude());
                    PharmacyLocationResponse response = createLocationResponse(shop);
                    // We'll use a custom field to track distance for filtering
                    return new Object[]{response, distance};
                })
                .filter(arr -> (Double) arr[1] <= radiusKm)
                .sorted(Comparator.comparingDouble(arr -> (Double) arr[1]))
                .map(arr -> (PharmacyLocationResponse) arr[0])
                .collect(Collectors.toList());
    }
    
    /**
     * Get list of unique medicine names for autocomplete
     */
    public List<String> getMedicineSuggestions(String query) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }
        
        // Use the dedicated query for suggestions
        List<String> suggestions = shopMedicineRepository.findMedicineNameSuggestions(query.trim());
        
        // Limit results
        return suggestions.stream()
                .limit(20)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Format distance for display
     */
    private String formatDistance(double distanceKm) {
        if (distanceKm < 1) {
            return String.format("%d m", (int) (distanceKm * 1000));
        } else {
            return String.format("%.1f km", distanceKm);
        }
    }
    
    private PharmacySearchResponse createSearchResponse(ShopMedicine sm, Double userLat, Double userLon) {
        MedicineShop shop = sm.getShop();
        double distance = calculateDistance(userLat, userLon, shop.getLatitude(), shop.getLongitude());
        
        return PharmacySearchResponse.builder()
                .pharmacyId(shop.getId())
                .pharmacyName(shop.getName())
                .pharmacySlug(shop.getSlug())
                .address(shop.getAddress())
                .area(shop.getArea())
                .ward(shop.getWard())
                .city(shop.getCity())
                .phone(shop.getPhone())
                .latitude(shop.getLatitude())
                .longitude(shop.getLongitude())
                .rating(shop.getRating())
                .ratingCount(shop.getRatingCount())
                .logoUrl(shop.getLogoUrl())
                .medicineId(sm.getMedicine().getId())
                .medicineName(sm.getMedicine().getBrandName())
                .genericName(sm.getMedicine().getGenericName())
                .dosageForm(sm.getMedicine().getDosageForm())
                .strength(sm.getMedicine().getStrength())
                .price(sm.getPrice())
                .discountPrice(sm.getDiscountPrice())
                .stockQuantity(sm.getStockQuantity())
                .isAvailable(sm.getIsAvailable())
                .distanceKm(distance)
                .distanceFormatted(formatDistance(distance))
                .build();
    }
    
    private PharmacyLocationResponse createLocationResponse(MedicineShop shop) {
        return PharmacyLocationResponse.builder()
                .id(shop.getId())
                .name(shop.getName())
                .slug(shop.getSlug())
                .address(shop.getAddress())
                .area(shop.getArea())
                .ward(shop.getWard())
                .city(shop.getCity())
                .phone(shop.getPhone())
                .latitude(shop.getLatitude())
                .longitude(shop.getLongitude())
                .rating(shop.getRating())
                .ratingCount(shop.getRatingCount())
                .logoUrl(shop.getLogoUrl())
                .totalProducts(shop.getTotalProducts())
                .isOpen(true) // For demo, assume all are open
                .build();
    }
}
