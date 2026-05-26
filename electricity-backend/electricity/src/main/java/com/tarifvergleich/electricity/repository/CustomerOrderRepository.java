package com.tarifvergleich.electricity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerOrder;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Integer> {

	Optional<CustomerOrder> findByIdAndAdminAdminId(Integer id, Integer adminId);

	Optional<CustomerOrder> findByDeliveryId(Integer deliveryId);

	List<CustomerOrder> findAllByAdminPlacedOrderAndIsExpiredAndIsCancelled(Boolean adminPlacedOrder, Boolean isExpired,
			Boolean isCancelled);
	
	@Query("SELECT c.id FROM CustomerOrder c WHERE c.adminPlacedOrder = :adminPlacedOrder AND c.isExpired = :isExpired AND c.isCancelled = :isCancelled")
	List<Integer> findIdsByAdminPlacedOrderAndIsExpiredAndIsCancelled(
	    @Param("adminPlacedOrder") Boolean adminPlacedOrder, 
	    @Param("isExpired") Boolean isExpired, 
	    @Param("isCancelled") Boolean isCancelled
	);
}
