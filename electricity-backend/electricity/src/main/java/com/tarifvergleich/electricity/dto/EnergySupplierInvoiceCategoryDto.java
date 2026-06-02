package com.tarifvergleich.electricity.dto;

import com.tarifvergleich.electricity.model.EnergySupplierInvoiceCategory;
import com.tarifvergleich.electricity.model.invoiceSupplierMessageCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergySupplierInvoiceCategoryDto {
	 private Long invoiceCategoryId;
    private Integer adminId;
    private String categoryName;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class InvoiceSupplierCategoryAdminResponseDto {
        private Long invoiceCategoryId;
        private String categoryName;
        private BigInteger createdOn;
        private BigInteger updatedOn;
    }
    

    public static InvoiceSupplierCategoryAdminResponseDto mapForAdmin(invoiceSupplierMessageCategory category) {
        return InvoiceSupplierCategoryAdminResponseDto.builder()
                .invoiceCategoryId(category.getId())
                .categoryName(category.getCategoryName())
                .createdOn(category.getCreatedOn())
                .updatedOn(category.getUpdatedOn())
                .build();
    }
    
    public static InvoiceSupplierCategoryAdminResponseDto mapForAdminRes(EnergySupplierInvoiceCategory category) {
    	return InvoiceSupplierCategoryAdminResponseDto.builder()
    			.invoiceCategoryId(Integer.toUnsignedLong(category.getId()))
    			.categoryName(category.getCategoryName())
    			.createdOn(category.getCreatedOn())
    			.updatedOn(category.getUpdatedOn())
    			.build();
    }
}
