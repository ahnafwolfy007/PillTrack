package com.pilltrack.service;

import com.pilltrack.dto.request.ShopMedicineRequest;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.dto.response.ShopMedicineResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceAlreadyExistsException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Medicine;
import com.pilltrack.model.entity.MedicineShop;
import com.pilltrack.model.entity.ShopMedicine;
import com.pilltrack.model.entity.User;
import com.pilltrack.repository.MedicineRepository;
import com.pilltrack.repository.MedicineShopRepository;
import com.pilltrack.repository.ShopMedicineRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShopMedicineService {
    
    private final ShopMedicineRepository shopMedicineRepository;
    private final MedicineShopRepository shopRepository;
    private final MedicineRepository medicineRepository;
    private final CurrentUser currentUser;
    
    public PageResponse<ShopMedicineResponse> getShopMedicines(Long shopId, Pageable pageable) {
        shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", shopId));
        Page<ShopMedicine> page = shopMedicineRepository.findByShopIdAndIsAvailableTrue(shopId, pageable);
        return mapToPageResponse(page);
    }
    
    public ShopMedicineResponse getShopMedicineById(Long id) {
        ShopMedicine shopMedicine = shopMedicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop Medicine", "id", id));
        return mapToResponse(shopMedicine);
    }
    
    public List<ShopMedicineResponse> getShopsByMedicine(Long medicineId) {
        medicineRepository.findById(medicineId)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", medicineId));
        return shopMedicineRepository.findByMedicineId(medicineId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PageResponse<ShopMedicineResponse> searchShopMedicines(Long shopId, String query, Pageable pageable) {
        shopRepository.findById(shopId)
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "id", shopId));
        Page<ShopMedicine> page = shopMedicineRepository.searchByShopId(shopId, query, pageable);
        return mapToPageResponse(page);
    }
    
    public PageResponse<ShopMedicineResponse> getAvailableMedicines(Pageable pageable) {
        Page<ShopMedicine> page = shopMedicineRepository.findAll(pageable);
        return mapToPageResponse(page);
    }
    
    public PageResponse<ShopMedicineResponse> getInStockMedicines(Pageable pageable) {
        return getAvailableMedicines(pageable);
    }
    
    public PageResponse<ShopMedicineResponse> getCurrentOwnerInventory(Pageable pageable) {
        User user = currentUser.getUser();
        MedicineShop shop = shopRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "owner", user.getEmail()));
        Page<ShopMedicine> page = shopMedicineRepository.findByShopIdAndIsAvailableTrue(shop.getId(), pageable);
        return mapToPageResponse(page);
    }
    
    @Transactional
    public ShopMedicineResponse addMedicineToShop(ShopMedicineRequest request) {
        User user = currentUser.getUser();
        MedicineShop shop = shopRepository.findByOwnerId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Shop", "owner", user.getEmail()));
        
        Medicine medicine = medicineRepository.findById(request.getMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("Medicine", "id", request.getMedicineId()));
        
        if (shopMedicineRepository.existsByShopIdAndMedicineId(shop.getId(), medicine.getId())) {
            throw new ResourceAlreadyExistsException("Shop Medicine", "medicine", medicine.getBrandName());
        }
        
        ShopMedicine shopMedicine = new ShopMedicine();
        shopMedicine.setShop(shop);
        shopMedicine.setMedicine(medicine);
        shopMedicine.setPrice(request.getPrice());
        shopMedicine.setDiscountPrice(request.getDiscountPrice());
        shopMedicine.setStockQuantity(request.getStockQuantity());
        shopMedicine.setMinStockAlert(request.getMinStockAlert() != null ? request.getMinStockAlert() : 10);
        shopMedicine.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        shopMedicine.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        shopMedicine.setBatchNumber(request.getBatchNumber());
        shopMedicine.setExpiryDate(request.getExpiryDate());
        shopMedicine.setManufactureDate(request.getManufactureDate());
        
        shopMedicine = shopMedicineRepository.save(shopMedicine);
        return mapToResponse(shopMedicine);
    }
    
    @Transactional
    public ShopMedicineResponse updateShopMedicine(Long id, ShopMedicineRequest request) {
        ShopMedicine shopMedicine = shopMedicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop Medicine", "id", id));
        
        User user = currentUser.getUser();
        if (!shopMedicine.getShop().getOwner().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to update this inventory item");
        }
        
        shopMedicine.setPrice(request.getPrice());
        shopMedicine.setDiscountPrice(request.getDiscountPrice());
        shopMedicine.setStockQuantity(request.getStockQuantity());
        shopMedicine.setMinStockAlert(request.getMinStockAlert() != null ? request.getMinStockAlert() : 10);
        shopMedicine.setIsAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true);
        shopMedicine.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);
        shopMedicine.setBatchNumber(request.getBatchNumber());
        shopMedicine.setExpiryDate(request.getExpiryDate());
        shopMedicine.setManufactureDate(request.getManufactureDate());
        
        shopMedicine = shopMedicineRepository.save(shopMedicine);
        return mapToResponse(shopMedicine);
    }
    
    @Transactional
    public ShopMedicineResponse updateStock(Long id, int quantity) {
        ShopMedicine shopMedicine = shopMedicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop Medicine", "id", id));
        
        User user = currentUser.getUser();
        if (!shopMedicine.getShop().getOwner().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to update this inventory item");
        }
        
        if (quantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }
        
        shopMedicine.setStockQuantity(quantity);
        shopMedicine.setIsAvailable(quantity > 0);
        
        shopMedicine = shopMedicineRepository.save(shopMedicine);
        return mapToResponse(shopMedicine);
    }
    
    @Transactional
    public void removeMedicineFromShop(Long id) {
        ShopMedicine shopMedicine = shopMedicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shop Medicine", "id", id));
        
        User user = currentUser.getUser();
        if (!shopMedicine.getShop().getOwner().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to remove this inventory item");
        }
        
        shopMedicineRepository.delete(shopMedicine);
    }
    
    private PageResponse<ShopMedicineResponse> mapToPageResponse(Page<ShopMedicine> page) {
        List<ShopMedicineResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<ShopMedicineResponse>builder()
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
    
    private ShopMedicineResponse mapToResponse(ShopMedicine shopMedicine) {
        Medicine medicine = shopMedicine.getMedicine();
        MedicineShop shop = shopMedicine.getShop();
        
        BigDecimal effectivePrice = shopMedicine.getDiscountPrice() != null ? 
                shopMedicine.getDiscountPrice() : shopMedicine.getPrice();
        
        boolean isLowStock = shopMedicine.getStockQuantity() <= shopMedicine.getMinStockAlert();
        boolean isOutOfStock = shopMedicine.getStockQuantity() <= 0;
        boolean isExpiringSoon = shopMedicine.getExpiryDate() != null && 
                shopMedicine.getExpiryDate().isBefore(java.time.LocalDate.now().plusDays(30));
        
        return ShopMedicineResponse.builder()
                .id(shopMedicine.getId())
                .shopId(shop.getId())
                .shopName(shop.getName())
                .shopSlug(shop.getSlug())
                .shopRating(shop.getRating() != null ? shop.getRating().doubleValue() : 0.0)
                .shopCity(shop.getCity())
                .medicineId(medicine.getId())
                .medicineBrandName(medicine.getBrandName())
                .medicineGenericName(medicine.getGenericName())
                .medicineSlug(medicine.getSlug())
                .medicineStrength(medicine.getStrength())
                .medicineForm(medicine.getForm())
                .manufacturerName(medicine.getManufacturer() != null ? medicine.getManufacturer().getName() : null)
                .categoryName(medicine.getCategory() != null ? medicine.getCategory().getName() : null)
                .price(shopMedicine.getPrice())
                .discountPrice(shopMedicine.getDiscountPrice())
                .discountPercent(shopMedicine.getDiscountPercent())
                .effectivePrice(effectivePrice)
                .stockQuantity(shopMedicine.getStockQuantity())
                .isAvailable(shopMedicine.getIsAvailable())
                .isLowStock(isLowStock)
                .isOutOfStock(isOutOfStock)
                .expiryDate(shopMedicine.getExpiryDate())
                .isExpiringSoon(isExpiringSoon)
                .isFeatured(shopMedicine.getIsFeatured())
                .soldCount(shopMedicine.getSoldCount())
                .createdAt(shopMedicine.getCreatedAt())
                .build();
    }
}
