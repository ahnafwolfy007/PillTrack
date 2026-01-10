package com.pilltrack.service;

import com.pilltrack.dto.request.PrescriptionRequest;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.dto.response.PrescriptionResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Prescription;
import com.pilltrack.model.entity.User;
import com.pilltrack.repository.PrescriptionRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {
    
    private final PrescriptionRepository prescriptionRepository;
    private final CurrentUser currentUser;
    
    public PageResponse<PrescriptionResponse> getCurrentUserPrescriptions(Pageable pageable) {
        User user = currentUser.getUser();
        Page<Prescription> page = prescriptionRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return mapToPageResponse(page);
    }
    
    public PrescriptionResponse getPrescriptionById(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        
        User user = currentUser.getUser();
        if (!prescription.getUser().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to view this prescription");
        }
        
        return mapToResponse(prescription);
    }
    
    public List<PrescriptionResponse> getUnverifiedPrescriptions() {
        return prescriptionRepository.findUnverified().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionResponse> getActivePrescriptions(Long userId) {
        return prescriptionRepository.findActiveByUserId(userId, LocalDate.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<PrescriptionResponse> getPrescriptionsByOrder(Long orderId) {
        return prescriptionRepository.findByOrderId(orderId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public PageResponse<PrescriptionResponse> getPendingPrescriptions(Pageable pageable) {
        Page<Prescription> page = prescriptionRepository.findByIsVerifiedFalseAndIsActiveTrue(pageable);
        return mapToPageResponse(page);
    }
    
    @Transactional
    public PrescriptionResponse uploadPrescription(PrescriptionRequest request) {
        User user = currentUser.getUser();
        
        Prescription prescription = new Prescription();
        prescription.setUser(user);
        prescription.setFileUrl(request.getFileUrl());
        prescription.setFileType(request.getFileType());
        prescription.setDoctorName(request.getDoctorName());
        prescription.setHospitalName(request.getHospitalName());
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setExpiryDate(request.getExpiryDate());
        prescription.setNotes(request.getNotes());
        prescription.setIsVerified(false);
        prescription.setIsActive(true);
        
        prescription = prescriptionRepository.save(prescription);
        return mapToResponse(prescription);
    }
    
    @Transactional
    public PrescriptionResponse verifyPrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        
        User verifier = currentUser.getUser();
        prescription.setIsVerified(true);
        prescription.setVerifiedBy(verifier);
        prescription.setVerifiedAt(LocalDateTime.now());
        
        prescription = prescriptionRepository.save(prescription);
        return mapToResponse(prescription);
    }
    
    @Transactional
    public PrescriptionResponse uploadPrescription(PrescriptionRequest request, String fileUrl, 
            String fileType, Long fileSize, String originalFileName) {
        User user = currentUser.getUser();
        
        Prescription prescription = new Prescription();
        prescription.setUser(user);
        prescription.setFileUrl(fileUrl);
        prescription.setFileType(fileType);
        prescription.setFileSize(fileSize);
        prescription.setOriginalFileName(originalFileName);
        prescription.setDoctorName(request.getDoctorName());
        prescription.setHospitalName(request.getHospitalName());
        prescription.setPrescriptionDate(request.getPrescriptionDate());
        prescription.setExpiryDate(request.getExpiryDate());
        prescription.setNotes(request.getNotes());
        prescription.setIsVerified(false);
        prescription.setIsActive(true);
        
        prescription = prescriptionRepository.save(prescription);
        return mapToResponse(prescription);
    }
    
    @Transactional
    public PrescriptionResponse verifyPrescription(Long id, String verificationNotes) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        
        User verifier = currentUser.getUser();
        prescription.setIsVerified(true);
        prescription.setVerifiedBy(verifier);
        prescription.setVerifiedAt(LocalDateTime.now());
        prescription.setVerificationNotes(verificationNotes);
        
        prescription = prescriptionRepository.save(prescription);
        return mapToResponse(prescription);
    }
    
    @Transactional
    public PrescriptionResponse rejectPrescription(Long id, String reason) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        
        prescription.setIsVerified(false);
        prescription.setVerificationNotes(reason);
        prescription.setIsActive(false);
        
        prescription = prescriptionRepository.save(prescription);
        return mapToResponse(prescription);
    }
    
    @Transactional
    public void deletePrescription(Long id) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription", "id", id));
        
        User user = currentUser.getUser();
        if (!prescription.getUser().getId().equals(user.getId()) && !currentUser.isAdmin()) {
            throw new AccessDeniedException("You don't have permission to delete this prescription");
        }
        
        prescriptionRepository.delete(prescription);
    }
    
    private PageResponse<PrescriptionResponse> mapToPageResponse(Page<Prescription> page) {
        List<PrescriptionResponse> content = page.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return PageResponse.<PrescriptionResponse>builder()
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
    
    private PrescriptionResponse mapToResponse(Prescription prescription) {
        boolean isExpired = prescription.getExpiryDate() != null && 
                prescription.getExpiryDate().isBefore(LocalDate.now());
        
        return PrescriptionResponse.builder()
                .id(prescription.getId())
                .userId(prescription.getUser().getId())
                .userName(prescription.getUser().getName())
                .doctorName(prescription.getDoctorName())
                .hospitalName(prescription.getHospitalName())
                .prescriptionDate(prescription.getPrescriptionDate())
                .expiryDate(prescription.getExpiryDate())
                .fileUrl(prescription.getFileUrl())
                .fileType(prescription.getFileType())
                .fileSize(prescription.getFileSize())
                .originalFileName(prescription.getOriginalFileName())
                .isVerified(prescription.getIsVerified())
                .verifiedByName(prescription.getVerifiedBy() != null ? 
                        prescription.getVerifiedBy().getName() : null)
                .verifiedAt(prescription.getVerifiedAt())
                .verificationNotes(prescription.getVerificationNotes())
                .isActive(prescription.getIsActive())
                .isExpired(isExpired)
                .notes(prescription.getNotes())
                .createdAt(prescription.getCreatedAt())
                .updatedAt(prescription.getUpdatedAt())
                .build();
    }
}
