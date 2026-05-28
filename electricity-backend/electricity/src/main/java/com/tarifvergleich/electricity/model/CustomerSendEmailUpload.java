package com.tarifvergleich.electricity.model;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "customer_send_upload_documents")
public class CustomerSendEmailUpload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "send_email_history_id")
    @JsonIgnore
    private CustomerEmailSendHistory sendEmailHistory;
    
    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private AdminUser admin;
    
    @Column(name = "file_name")
    private String fileName;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;
    
    @PrePersist
	protected void onCreate() {
    	createdDate = Helper.getCurrentTimeBerlin();
	}
    @Column(name = "created_date")
    private BigInteger createdDate;
}