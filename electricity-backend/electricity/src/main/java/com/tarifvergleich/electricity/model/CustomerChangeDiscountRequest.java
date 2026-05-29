package com.tarifvergleich.electricity.model;

import java.math.BigInteger;

import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "customer_change_discount_request")
public class CustomerChangeDiscountRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "new_advance_amount")
    private String newAdvanceAmount;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "order_id")
    private Integer orderId;
    
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "delivery_id")
    private CustomerDelivery customerDelivery;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private AdminUser admin;

    @Column(name = "created_on")
    private BigInteger createdOn;

    @Column(name = "status")
    private Integer status;
    
    @PrePersist
    protected void onCreate() {
        createdOn = Helper.getCurrentTimeBerlin();
        status = 0;
    }
}