package com.tarifvergleich.electricity.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CancellationServiceCategory;

@Repository
public interface CancellationServiceCategoryRepo extends JpaRepository<CancellationServiceCategory, Integer> {

	Optional<CancellationServiceCategory> findByCategoryNameLikeAndAdminAdminId(String categoryName, Integer adminId);

	List<CancellationServiceCategory> findAllByAdminAdminIdOrderByCategoryNameAsc(Integer adminId);

}
