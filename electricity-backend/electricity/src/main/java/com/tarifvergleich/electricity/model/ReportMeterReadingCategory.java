package com.tarifvergleich.electricity.model;

import java.math.BigInteger;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "report_meter_reading_categories")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class ReportMeterReadingCategory {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;

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

	@OneToMany(mappedBy = "category")
	@JsonIgnoreProperties("category")
	private List<ReportMeterReading> reportMeterReading;

	@PrePersist
	protected void onCreate() {
		createdOn = Helper.getCurrentTimeBerlin();
	}

	@PreUpdate
	public void updatedon() {
		this.updatedOn = Helper.getCurrentTimeBerlin();
	}
}
