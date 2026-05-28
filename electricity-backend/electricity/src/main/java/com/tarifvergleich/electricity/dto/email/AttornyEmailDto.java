package com.tarifvergleich.electricity.dto.email;

import java.util.Set;

import com.tarifvergleich.electricity.model.ManageAdminDocument;

public record AttornyEmailDto(String to, String body, String base64pdf, String pdfName, Set<ManageAdminDocument> docs) {

}
