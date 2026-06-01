package com.tarifvergleich.electricity.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.service.admin.AdminReportMeterReadingService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminReportMeterReadingController {

    private final AdminReportMeterReadingService reportMeterReadingservice;

    @GetMapping("/report-meter-reading")
    public ResponseEntity<?> getAllMeterReadings() {

        return ResponseEntity.ok(
        		reportMeterReadingservice.getAllMeterReadings()
        );
    }
}
