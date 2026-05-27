package com.tarifvergleich.electricity.model;

import java.math.BigInteger;

import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "customer_email_send_history")
public class CustomerEmailSendHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long customerId;

    private Long adminId;
    
    @Column(name = "title")
    private String title;

    @Column(name = "subtitle")
    private String subtitle;

    @Column(name = "email_content", columnDefinition = "TEXT")
    private String emailContent;
    
    @Column(name = "created_date")
    private BigInteger sentOn;
    
    @PrePersist
	protected void onCreate() {
    	sentOn = Helper.getCurrentTimeBerlin();
	}
}