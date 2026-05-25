package com.tarifvergleich.electricity.model;

import java.math.BigInteger;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "email_management")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminEmailManagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;

    @Column(name = "subtitle")
    private String subtitle;

    @Column(name = "email_content", columnDefinition = "TEXT")
    private String emailContent;

    @Column(name = "created_date")
    private BigInteger createdDate;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cate_id")
    @JsonIgnore
    private AdminEmailRequestCategory category;
    
    @ManyToMany
    @JoinTable(
        name = "email_management_documents", joinColumns = @JoinColumn(name = "email_management_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    @JsonIgnore
    private Set<ManageAdminDocument> documents;
    
    @ManyToOne
    @JoinColumn(name = "admin_id")
    @JsonIgnore
    private AdminUser admin;
	
	@PrePersist
	protected void onCreate() {
		createdDate = Helper.getCurrentTimeBerlin();
	}

}