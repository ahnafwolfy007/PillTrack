package com.pilltrack.service;

import com.pilltrack.dto.request.MedicineShopRequest;
import com.pilltrack.dto.response.MedicineShopResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceAlreadyExistsException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.MedicineShop;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.ShopStatus;
import com.pilltrack.repository.MedicineShopRepository;
import com.pilltrack.security.CurrentUser;
import com.pilltrack.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineShopService {
    
    private final MedicineShopRepository shopRepository;
    private final CurrentUser currentUser;
    
    public PageResponse<MedicineShopResponse> getAllActiveShops(Pageable pageable) {
        Page<MedicineShop> page = shopRepository.findByStatusAndIsActiveTrue(ShopStatus.VERIFIED, pageable);
        return mapToPageResponse(page);
    }
    
    public PageResponse<MedicineShopResponse> getAllShops(Pageable pageable) {
        Page<MedicineShop> page = shopRepository.findAll(pageable);
        return mapToPageResponse(page);
    }
    
    public PageResponse<MedicineShopResponse> getShopsByStatus(ShopStatus status, Pageable pageable) {
        Page<MedicineShop> page = shopRepository.findByStatusAndIsActiveTrue(status, pageable);
        return mapToPageResponse(page);
    }
    
    public MedicineShopResponse getShopById(Long id) {
        MedicineShop shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", id));
        return mapToResponse(shop);
    }
    
    public MedicineShopResponse getShopBySlug(String slug) {
        MedicineShop shop = shopRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "slug", slug));
        return mapToResponse(shop);
    }
    
    public PageResponse<MedicineShopResponse> searchShops(String query, Pageable pageable) {
        Page<MedicineShop> page = shopRepository.search(query, pageable);
        return mapToPageResponse(page);
    }
    
    public List<MedicineShopResponse> getVerifiedShops() {
        return shopRepository.findByStatusAndIsActiveTrue(ShopStatus.VERIFIED).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public MedicineShopResponse getCurrentOwnerShop() {
        User user = currentUser.getUser();
        MedicineShop shop = shopRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "owner", user.getEmail()));
        return mapToResponse(shop);
    }
    
    public long getTotalShopCount() {
        return shopRepository.count();
    }
    
    public long getShopCountByStatus(ShopStatus status) {
        return shopRepository.findByStatusAndIsActiveTrue(status).size();
    }
    
    @Transactional
    public MedicineShopResponse createShop(MedicineShopRequest request) {
        User user = currentUser.getUser();
        
        if (shopRepository.existsByOwnerId(user.getId())) {
            throw new ResourceAlreadyExistsException("Shop", "owner", user.getEmail());
        }
        
        if (shopRepository.existsBySlug(SlugUtils.generateSlug(request.getName()))) {
            throw new ResourceAlreadyExistsException("Shop", "name", request.getName());
        }
        
        MedicineShop shop = new MedicineShop();
        shop.setName(request.getName());
        shop.setSlug(SlugUtils.generateSlug(request.getName()));
        shop.setDescription(request.getDescription());
        shop.setLogoUrl(request.getLogoUrl());
        shop.setBannerUrl(request.getBannerUrl());
        shop.setAddress(request.getAddress());
        shop.setCity(request.getCity());
        shop.setArea(request.getArea());
        shop.setWard(request.getWard());
        shop.setPostalCode(request.getPostalCode());
        shop.setLatitude(request.getLatitude());
        shop.setLongitude(request.getLongitude());
        shop.setPhone(request.getPhone());
        shop.setAlternatePhone(request.getAlternatePhone());
        shop.setEmail(request.getEmail());
        shop.setLicenseNumber(request.getLicenseNumber());
        shop.setTaxId(request.getTaxId());
        shop.setOwner(user);
        shop.setStatus(ShopStatus.PENDING);
        shop.setIsVerified(false);
        
        shop = shopRepository.save(shop);
        return mapToResponse(shop);
    }
    
    @Transactional
    public MedicineShopResponse updateShop(Long id, MedicineShopRequest request) {
        MedicineShop shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", id));
        
        User user = currentUser.getUser();
        if (!shop.getOwner().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to update this shop");
        }
        
        String newSlug = SlugUtils.generateSlug(request.getName());
        if (!shop.getSlug().equals(newSlug) && shopRepository.existsBySlug(newSlug)) {
            throw new ResourceAlreadyExistsException("Shop", "name", request.getName());
        }
        
        shop.setName(request.getName());
        shop.setSlug(newSlug);
        shop.setDescription(request.getDescription());
        shop.setLogoUrl(request.getLogoUrl());
        shop.setBannerUrl(request.getBannerUrl());
        shop.setAddress(request.getAddress());
        shop.setCity(request.getCity());
        shop.setArea(request.getArea());
        shop.setWard(request.getWard());
        shop.setPostalCode(request.getPostalCode());
        shop.setLatitude(request.getLatitude());
        shop.setLongitude(request.getLongitude());
        shop.setPhone(request.getPhone());
        shop.setAlternatePhone(request.getAlternatePhone());
        shop.setEmail(request.getEmail());
        shop.setLicenseNumber(request.getLicenseNumber());
        shop.setTaxId(request.getTaxId());
        
        shop = shopRepository.save(shop);
        return mapToResponse(shop);
    }
    
    @Transactional
    public MedicineShopResponse updateShopStatus(Long id, ShopStatus status) {
        MedicineShop shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", id));
        shop.setStatus(status);
        shop = shopRepository.save(shop);
        return mapToResponse(shop);
    }
    
    @Transactional
    public MedicineShopResponse verifyShop(Long id) {
        MedicineShop shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", id));
        shop.setIsVerified(true);
        shop.setStatus(ShopStatus.VERIFIED);
        shop = shopRepository.save(shop);
        return mapToResponse(shop);
    }
    
    @Transactional
    public void deleteShop(Long id) {
        MedicineShop shop = shopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", id));
        shopRepository.delete(shop);
    }
    
    private PageResponse<MedicineShopResponse> mapToPageResponse(Page<MedicineShop> page) {
        List<MedicineShopResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<MedicineShopResponse>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
    
    private MedicineShopResponse mapToResponse(MedicineShop shop) {
        return MedicineShopResponse.builder()
                .id(shop.getId())
                .name(shop.getName())
                .slug(shop.getSlug())
                .description(shop.getDescription())
                .logoUrl(shop.getLogoUrl())
                .bannerUrl(shop.getBannerUrl())
                .address(shop.getAddress())
                .city(shop.getCity())
                .area(shop.getArea())
                .ward(shop.getWard())
                .postalCode(shop.getPostalCode())
                .country(shop.getCountry())
                .latitude(shop.getLatitude())
                .longitude(shop.getLongitude())
                .phone(shop.getPhone())
                .alternatePhone(shop.getAlternatePhone())
                .email(shop.getEmail())
                .licenseNumber(shop.getLicenseNumber())
                .taxId(shop.getTaxId())
                .status(shop.getStatus())
                .isVerified(shop.getIsVerified())
                .rating(shop.getRating())
                .totalProducts(shop.getTotalProducts())
                .totalOrders(shop.getTotalOrders())
                .ownerId(shop.getOwner().getId())
                .ownerName(shop.getOwner().getName())
                .createdAt(shop.getCreatedAt())
                .build();
    }
}
