package com.tarifvergleich.electricity.model;

import java.math.BigInteger;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
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