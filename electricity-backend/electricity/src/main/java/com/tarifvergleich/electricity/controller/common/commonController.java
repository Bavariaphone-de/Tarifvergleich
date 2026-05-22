package com.tarifvergleich.electricity.controller.common;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.tarifvergleich.electricity.dto.request.CustomerQueryContactRequestDTO;
//import com.tarifvergleich.electricity.service.RecaptchaService;
import com.tarifvergleich.electricity.service.common.CommonService;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping

public class commonController {

    private final CommonService commonService;
//    private RecaptchaService recaptchaService;

    @PostMapping("/fetch-contact-category")
    public ResponseEntity<?> fetchContactCategory() {
        return ResponseEntity.ok(commonService.getAllCategories());
    }

//    @PostMapping("/save-customer-contact")
//    public ResponseEntity<?> saveCustomerContact(@RequestBody CustomerQueryContactRequestDTO dto) {
//    	
//    	if (!recaptchaService.verify(dto.getRecaptchaToken())) {
//    	    return ResponseEntity.status(400)
//    	        .body(Map.of("error", "reCAPTCHA-Verifizierung fehlgeschlagen."));
//    	}
//    	
//        Map<String, Object> response = commonService.saveQuery(dto);
//        return ResponseEntity.status(HttpStatus.CREATED).body(response);
//    }

    @PostMapping("/fetch-customer-queries")
    public ResponseEntity<?> fetchCustomerQueries() {
        return ResponseEntity.ok(commonService.getAllCustomers());
    }

    @PostMapping("/link-customer-query")
    public ResponseEntity<?> linkCustomerQuery(@RequestBody Map<String, Object> payload) {
        Integer queryId = payload.get("customerQueryContactId") != null ? ((Number) payload.get("customerQueryContactId")).intValue() : null;

        List<?> rawCustomerIds = (List<?>) payload.get("customerIds");
        List<Integer> customerIds = null;
        if (rawCustomerIds != null) {
            customerIds = rawCustomerIds.stream()
                    .map(id -> ((Number) id).intValue())
                    .collect(java.util.stream.Collectors.toList());
        }
        return ResponseEntity.ok(commonService.linkCustomersToQuery(queryId, customerIds));
    }
}