package com.tarifvergleich.electricity.repository;

import com.tarifvergleich.electricity.model.invoiceSupplierMessageCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface EnergyInvoiceMessageCategoryRepo extends JpaRepository<invoiceSupplierMessageCategory, Long> {
    List<invoiceSupplierMessageCategory> findAllByAdminAdminIdOrderByCategoryNameAsc(Integer adminId);
}
