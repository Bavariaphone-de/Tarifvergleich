package com.tarifvergleich.electricity.dto.email;

public record ContractMailDto(String to, String subject, String body, String absolutePath) {

}
