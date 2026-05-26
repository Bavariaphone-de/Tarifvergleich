package com.tarifvergleich.electricity.dto.email;

public record AttornyEmailDto(String to, String body, String base64pdf, String pdfName) {

}
