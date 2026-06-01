package com.tarifvergleich.electricity.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.tarifvergleich.electricity.model.CustomerSelectedProvider;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnergyRateDto {
	private Long rateId;
	private String rateName;
	private Long providerId;
	private Long netzProviderId;
	private String providerName;
	private String providerSVG;
	private String providerSVGPath;
	private Integer consumption;

	// Pricing Data
	private double basePriceYear;
	private double basePriceMonth;
	private double workPrice;
	private double totalPrice;
	private double totalPriceMonth;
	private double savingPerYear;
	private double workPriceNt;
	private double optBonus;

	// Contract Details
	private int partialPayment;
	private String optGuarantee;
	private String optGuaranteeType;
	private String optTerm;
	private List<String> rateChangeType;
	private int cancel;
	private int cancelType;
	private String termBeforeNewType;
	@JsonFormat(pattern = "dd.MM.yyyy")
	private LocalDate termBeforeNewMaxDate;

	// Status Flags
	private boolean selfPayment;
	private boolean requiredEmail;
	private boolean optEco;
	private boolean recommended;

	private List<Map<String, Object>> commission;

	// Meta Data
	private String branch;
	private String type;
	
	// Extra meta data from egon
	private Long rateFileId;
    private boolean providerChangeFast;
    private boolean providerDigitalSigned;
    private int termBeforeNew;
    private int termBeforeChange;
    private String termBeforeChangeType;
    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate termBeforeChangeMaxDate;
    private int termAfterNew;
    private String termAfterNewType;
    @JsonFormat(pattern = "dd.MM.yyyy")
    private LocalDate termAfterNewMaxDate;
    private boolean optinAdvertisePhone;
    private boolean optinAdvertiseMobile;
    private boolean optinAdvertiseEmail;
    private boolean optinAdvertisePost;
    private boolean optinAdvertisePersonally;
    private int providerBirthdayMax;
    private double optBonusInstant;
    private double optBonusLoyalty;
    private Long distributorId;
    private List<Object> additionalInformation;
    private int counterType;
    private int rateReadingType;
    private int rateType;
    private boolean ratePriceStages;

	public static EnergyRateDto getProviderResponse(CustomerSelectedProvider provider) {
		if (provider == null)
			return null;
		
		return EnergyRateDto.builder().branch(provider.getBranch()).netzProviderId(provider.getNetzProviderId())
				.providerId(provider.getProviderId()).providerSVG(provider.getProviderSVGPath())
				.providerName(provider.getProviderName()).rateId(provider.getRateId())
				.basePriceMonth(Double.valueOf(provider.getRaw().get("basePriceMonth").toPrettyString()))
				.basePriceYear(provider.getBasePriceYear()).optTerm(provider.getRaw().get("optTerm").asText()).cancel(0)
				.workPrice(provider.getWorkPrice()).rateName(provider.getRateName())
				.totalPrice(provider.getTotalPrice()).totalPriceMonth(provider.getTotalPriceMonth()).build();
	}
}
