package com.tarifvergleich.electricity.dto.email;

import java.util.Set;

import com.tarifvergleich.electricity.model.ManageAdminDocument;

public record ContractMailDto(String to, String subject, String body, String absolutePath, Set<ManageAdminDocument> docs) {

}
