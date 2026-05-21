package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerConnect;

import jakarta.transaction.Transactional;

@Repository
public interface CustomerConnectionRepository
        extends JpaRepository<CustomerConnect, Long> {

    @Transactional
    @Modifying
    @Query(value = """
            UPDATE customer_connection
            SET meter_designation = :meterDesignation
            WHERE id = :connectionId
            """, nativeQuery = true)
    void updateMeterDesignation(
            @Param("connectionId") Long connectionId,
            @Param("meterDesignation") String meterDesignation
    );
}