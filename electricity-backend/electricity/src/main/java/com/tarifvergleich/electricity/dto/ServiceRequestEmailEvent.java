package com.tarifvergleich.electricity.dto;

import java.util.Set;

import com.tarifvergleich.electricity.model.ManageAdminDocument;

public record ServiceRequestEmailEvent(String customerMail, String customerSub, String customerBody, String adminMail,
		String adminSub, String adminBody, Set<ManageAdminDocument> docs) {

	public record ServiceResponseEmailEvent(String customerMail, String customerSub, String customerBody, Set<ManageAdminDocument> docs) {
	}

	public record ServiceAttachmentMailOfAcknowledgement(String customerMail, String customerSub, String custmerBody,
			Integer adminId, Set<ManageAdminDocument> docs) {

	}

}
