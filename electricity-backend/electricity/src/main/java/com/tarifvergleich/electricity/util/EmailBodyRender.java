package com.tarifvergleich.electricity.util;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminEmailManagement;
import com.tarifvergleich.electricity.repository.AdminEmailManagementRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class EmailBodyRender {

	private final AdminEmailManagementRepository adminEmailManagementRepo;
	private final CustomEmailTemplate customEmailTemplate;

	public String verifyOtpBody(String otp) {

		AdminEmailManagement adminEmailManagement = adminEmailManagementRepo.findByCategoryNameLike("VERIFICATION_OTP")
				.orElseThrow(() -> new InternalServerException("Error finding Email body", HttpStatus.OK));
		
		String tempEmailBody = adminEmailManagement.getEmailContent();
		
		tempEmailBody = tempEmailBody.replace("{OTP}", otp);
		
		String emailBody = customEmailTemplate.generateEmailHtml(adminEmailManagement.getTitle(), adminEmailManagement.getSubtitle(), tempEmailBody);
		
		return emailBody;
	}
	
	public String conscent365AdvisorBody() {
		return null;
	}
}
