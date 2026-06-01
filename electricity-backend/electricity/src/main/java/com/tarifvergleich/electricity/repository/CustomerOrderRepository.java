
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

	@Query("SELECT COUNT(co) FROM CustomerOrder co LEFT JOIN co.customerBookingDocument doc "
			+ "WHERE co.admin.adminId = :adminId " + "AND co.adminPlacedOrder = true "
			+ "AND (co.isExpired IS NULL OR co.isExpired = false) "
			+ "AND (doc IS NULL OR doc.signedFileUrl IS NULL OR TRIM(doc.signedFileUrl) = '')")
	long countOrderCreatedStatus(@Param("adminId") Integer adminId);

	Optional<CustomerOrder> findByDeliveryId(Integer deliveryId);

	Optional<CustomerOrder> findByOrderIdAndAdminAdminId(Long orderId, Integer adminId);

	Optional<CustomerOrder> findByOrderId(Long orderId);

	List<CustomerOrder> findAllByAdminPlacedOrderAndIsExpiredAndIsCancelled(Boolean adminPlacedOrder, Boolean isExpired,
			Boolean isCancelled);

	@Query("SELECT c.id FROM CustomerOrder c WHERE c.adminPlacedOrder = :adminPlacedOrder AND c.isExpired = :isExpired AND c.isCancelled = :isCancelled")
	List<Integer> findIdsByAdminPlacedOrderAndIsExpiredAndIsCancelled(
			@Param("adminPlacedOrder") Boolean adminPlacedOrder, @Param("isExpired") Boolean isExpired,
			@Param("isCancelled") Boolean isCancelled);
}