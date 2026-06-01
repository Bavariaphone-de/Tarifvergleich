package com.tarifvergleich.electricity.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigInteger;

@Entity
@Table(name = "energy_supplier_invoice_categories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class invoiceSupplierMessageCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_name")
    private String categoryName;

    @Column(name = "created_on")
    private BigInteger createdOn;

    @Column(name = "updated_on")
    private BigInteger updatedOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private AdminUser admin;

    @PrePersist
    protected void onCreate() {
        createdOn = Helper.getCurrentTimeBerlin();
    }

    @PreUpdate
    public void updatedon() {
        this.updatedOn = Helper.getCurrentTimeBerlin();
    }
}
