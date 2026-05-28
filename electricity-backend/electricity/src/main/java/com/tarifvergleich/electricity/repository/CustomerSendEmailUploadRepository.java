package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tarifvergleich.electricity.model.CustomerSendEmailUpload;

public interface CustomerSendEmailUploadRepository
    extends JpaRepository<CustomerSendEmailUpload, Long> {

}