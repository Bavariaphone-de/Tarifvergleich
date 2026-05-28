package com.tarifvergleich.electricity.dto.email;

import java.util.Set;

import com.tarifvergleich.electricity.model.ManageAdminDocument;

public record VerifyOtpEmail(String to, String subject, String body, Set<ManageAdminDocument> docs) {

}
