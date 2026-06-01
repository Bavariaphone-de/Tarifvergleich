package com.tarifvergleich.electricity.controller.admin;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.CancellationServiceCategoryDto;
import com.tarifvergleich.electricity.dto.CustomerRequestCounsellingDto;
import com.tarifvergleich.electricity.dto.EnergySupplierInvoiceCategoryDto;
import com.tarifvergleich.electricity.dto.EnergySupplierMessageCategoryDto;
import com.tarifvergleich.electricity.dto.ListOfHolidaysDto;
import com.tarifvergleich.electricity.dto.ManageAdminDocumentDto;
import com.tarifvergleich.electricity.dto.ReportMeterReadingCategoryDto;
import com.tarifvergleich.electricity.service.admin.AdminServicePointManagementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminServicePointManagementController {

	private final AdminServicePointManagementService adminServicePointManagementService;

	@PostMapping("/add-holidays")
	public ResponseEntity<?> addAndEditHolidays(@RequestBody ListOfHolidaysDto holidaysDto) {
		return ResponseEntity.ok(adminServicePointManagementService.adminAddHolidays(holidaysDto));
	}

	@PostMapping("/fetch-holidays")
	public ResponseEntity<?> fetchAllHolidays(@RequestBody ListOfHolidaysDto holidaysDto) {
		return ResponseEntity.ok(adminServicePointManagementService.adminGetHolidayList(holidaysDto.getAdminId(),
				holidaysDto.getYear()));
	}

	@PostMapping("/delete-holiday")
	public ResponseEntity<?> deleteHoliday(@RequestBody ListOfHolidaysDto holidaysDto) {
		return ResponseEntity.ok(adminServicePointManagementService.adminDeleteHolidays(holidaysDto));
	}

	@PostMapping("/fetch-counselling-request")
	public ResponseEntity<?> fetchCounsellingrequest(@RequestBody CustomerRequestCounsellingDto counsellingRequestDto) {
		return ResponseEntity.ok(adminServicePointManagementService.fetchCounsellingrequets(counsellingRequestDto));
	}

	@PostMapping("/toggle-counselling-request")
	public ResponseEntity<?> toggleCounsellingRequestConcluded(
			@RequestBody CustomerRequestCounsellingDto counsellingDto) {
		return ResponseEntity.ok(adminServicePointManagementService.toggleCustomerRequestCounsellingConcluded(
				counsellingDto.getAdminId(), counsellingDto.getCounsellingId(), counsellingDto.getConcluded()));
	}

	@PostMapping("/fetch-admin-documents")
	public ResponseEntity<?> fetchAdminDocument(@RequestBody ManageAdminDocumentDto adminDocDto) {
		return ResponseEntity.ok(adminServicePointManagementService.fetchAllAdminDocuments(adminDocDto));
	}

	@PostMapping("/add-supplier-message-category")
	public ResponseEntity<?> addSupplierMessageCategory(@RequestBody EnergySupplierMessageCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.addSupplierMessageCategory(categoryDto));
	}

	@PostMapping("/delete-supplier-message-category")
	public ResponseEntity<?> deleteSupplierMessageCategory(@RequestBody EnergySupplierMessageCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.deleteEnergySupplierMessageCategory(categoryDto));
	}

	@PostMapping("/fetch-supplier-message-category")
	public ResponseEntity<?> fetchSupplierMessageCategory(@RequestBody EnergySupplierMessageCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.fetchAllEnergySupplierCategory(categoryDto));
	}

	@PostMapping("/add-supplier-invoice-category")
	public ResponseEntity<?> addSupplierInvoiceCategory(@RequestBody EnergySupplierInvoiceCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.addSupplierInvoiceCategory(categoryDto));
	}

	@PostMapping("/delete-supplier-invoice-category")
	public ResponseEntity<?> deleteSupplierInvoiceCategory(@RequestBody EnergySupplierInvoiceCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.deleteSupplierInvoiceCategory(categoryDto));
	}

	@PostMapping("/fetch-supplier-invoice-category")
	public ResponseEntity<?> fetchSupplierInvoiceCategory(@RequestBody EnergySupplierInvoiceCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.fetchAllSupplierInvoiceCategory(categoryDto));
	}

	@PostMapping("/add-report-meter-reading-category")
	public ResponseEntity<?> addReportMeterReadingCategory(@RequestBody ReportMeterReadingCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.addReportMeterReadingCategory(categoryDto));
	}

	@PostMapping("/delete-report-meter-reading-category")
	public ResponseEntity<?> deleteReportMeterReadingCategory(@RequestBody ReportMeterReadingCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.deleteReportMeterReadingCategory(categoryDto));
	}

	@PostMapping("/fetch-report-meter-reading-category")
	public ResponseEntity<?> fetchReportMeterReadingCategory(@RequestBody ReportMeterReadingCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.fetchAllReportMeterReadingCategory(categoryDto));
	}

	@PostMapping("/add-cancellation-service-category")
	public ResponseEntity<?> addCancellationServiceCategory(@RequestBody CancellationServiceCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.addCancellationServiceCategory(categoryDto));
	}

	@PostMapping("/delete-cancellation-service-category")
	public ResponseEntity<?> deleteCancellationServiceCategory(
			@RequestBody CancellationServiceCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.deleteCancellationServiceCategory(categoryDto));
	}

	@PostMapping("/fetch-cancellation-service-category")
	public ResponseEntity<?> fetchCancellationServiceCategory(@RequestBody CancellationServiceCategoryDto categoryDto) {
		return ResponseEntity.ok(adminServicePointManagementService.fetchAllCancellationServiceCategory(categoryDto));
	}
}
