package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tarifvergleich.electricity.model.CustomerEmailSendHistory;

public interface CustomerEmailSendHistoryRepository
        extends JpaRepository<CustomerEmailSendHistory, Long> {
}