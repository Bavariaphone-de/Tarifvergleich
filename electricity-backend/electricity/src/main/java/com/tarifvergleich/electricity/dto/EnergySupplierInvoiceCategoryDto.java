package com.tarifvergleich.electricity.dto;

import com.tarifvergleich.electricity.model.EnergySupplierInvoiceCategory;
import lombok.Builder;
import lombok.Data;

@Data
public class EnergySupplierInvoiceCategoryDto {

    private Integer invoiceCategoryId;
    private String categoryName;
    private Integer adminId;

    @Data
    @Builder
    public static class EnergySupplierInvoiceCategoryAdminResponseDto {
        private Integer invoiceCategoryId;
        private String categoryName;
        private Long createdOn;
        private Long updatedOn;
    }

    public static EnergySupplierInvoiceCategoryAdminResponseDto mapForAdmin(EnergySupplierInvoiceCategory category) {
        if (category == null) return null;

        return EnergySupplierInvoiceCategoryAdminResponseDto.builder()
                .invoiceCategoryId(category.getId())
                .categoryName(category.getCategoryName())
                .createdOn(category.getCreatedOn() != null ? category.getCreatedOn().longValue() : null)
                .updatedOn(category.getUpdatedOn() != null ? category.getUpdatedOn().longValue() : null)
                .build();
    }
}
