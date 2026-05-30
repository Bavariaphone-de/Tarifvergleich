package com.tarifvergleich.electricity.service.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.ReportMeterReadingDto;
import com.tarifvergleich.electricity.model.ReportMeterReading;
import com.tarifvergleich.electricity.repository.ReportMeterReadingRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminReportMeterReadingService {

    private final ReportMeterReadingRepository reportMeterReadingRepository;

    public List<ReportMeterReadingDto> getAllMeterReadings() {

        return reportMeterReadingRepository.findAll()
                .stream()
                .map(this::convertToDto)
                .toList();
    }

    private ReportMeterReadingDto convertToDto(ReportMeterReading entity) {

        ReportMeterReadingDto dto = new ReportMeterReadingDto();

        dto.setId(entity.getId());
        dto.setDeliveryId(entity.getDeliveryId());
        dto.setOrderId(entity.getOrderId());
        dto.setConnectionId(entity.getConnectionId());
        dto.setCategory(entity.getCategory());
        dto.setReadingDate(entity.getReadingDate());
        dto.setMeterReading(entity.getMeterReading());
        dto.setImagePath(entity.getImagePath());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }
}