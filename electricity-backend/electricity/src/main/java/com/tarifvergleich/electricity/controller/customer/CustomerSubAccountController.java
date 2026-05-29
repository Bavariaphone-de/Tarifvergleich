package com.tarifvergleich.electricity.controller.customer;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.dto.CustomerInvitationDto;
import com.tarifvergleich.electricity.service.customer.CustomerInvitationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/customer")
public class CustomerSubAccountController {

	private final CustomerInvitationService customerInvitationService;
	
	@PostMapping("/send-invitation")
	public ResponseEntity<?> sendInvitation(@RequestBody CustomerInvitationDto invitationDto){
		return ResponseEntity.ok(customerInvitationService.sendInvitation(invitationDto));
	}
}
