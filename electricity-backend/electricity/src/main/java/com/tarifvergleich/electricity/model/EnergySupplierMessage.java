package com.tarifvergleich.electricity.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//@Entity
@Table(name = "energy_supplier_messages")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class EnergySupplierMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer id;
	
	@Column(columnDefinition = "TEXT")
	private String message;
	
	@ManyToOne
	private CustomerOrder customerOrder;
}
