package com.tarifvergleich.electricity.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.service.admin.AdminCustomerInvoiceRequestService;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminCustomerInvoiceRequestController {

    private final AdminCustomerInvoiceRequestService adminInvoiceRequestservice;

    @GetMapping("/customer-invoice-request")
    public ResponseEntity<?> getAllMeterReadings() {

        return ResponseEntity.ok(
        	adminInvoiceRequestservice.getAllMeterReadings()
        );
    }
}
