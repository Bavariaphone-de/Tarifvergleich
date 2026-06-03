package com.tarifvergleich.electricity.controller.admin;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.tarifvergleich.electricity.service.admin.AdminReportMeterReadingService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminReportMeterReadingController {

    private final AdminReportMeterReadingService reportMeterReadingService;

    @PostMapping("/report-meter-reading")
    public ResponseEntity<?> getAllMeterReadings(
            @RequestBody Map<String, Object> payload) {

        String search = payload.get("search") != null
                ? payload.get("search").toString()
                : "";

        return ResponseEntity.ok(
            reportMeterReadingService.getAllMeterReadings(search)
        );
    }
}
