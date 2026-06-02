package com.tarifvergleich.electricity.repository;

import com.tarifvergleich.electricity.model.CancellationServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CancellationServiceCategoryRepo extends JpaRepository<CancellationServiceCategory, Long> {
    List<CancellationServiceCategory> findAllByAdminAdminIdOrderByCategoryNameAsc(Integer adminId);
    
    Optional<CancellationServiceCategory> findByCategoryNameLikeAndAdminAdminId(String categoryName, Integer adminId);
}
