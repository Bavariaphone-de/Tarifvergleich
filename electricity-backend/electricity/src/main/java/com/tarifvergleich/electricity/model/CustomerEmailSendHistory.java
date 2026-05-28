package com.tarifvergleich.electricity.model;

import java.math.BigInteger;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    
    @ManyToMany
    @JoinTable(
        name = "customer_send_email_documents", joinColumns = @JoinColumn(name = "send_email_history_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    @JsonIgnore
    private List<ManageAdminDocument> documents;
    
    @OneToMany(mappedBy = "sendEmailHistory", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<CustomerSendEmailUpload> uploadDocuments;

    @PrePersist
	protected void onCreate() {
    	sentOn = Helper.getCurrentTimeBerlin();
	}
}