package com.tarifvergleich.electricity.controller.admin;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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

	@PostMapping("/customer-invoice-request")
	public ResponseEntity<?> getAllInvoiceRequests(@RequestBody Map<String, Object> payload) {

		String search = payload.get("search") != null ? payload.get("search").toString() : "";

		return ResponseEntity.ok(adminInvoiceRequestservice.getAllInvoiceRequests(search));
	}
}
