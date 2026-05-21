package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerDetailsContactHistory;

@Repository
public interface CustomerDetailsContactHistoryRepository extends JpaRepository<CustomerDetailsContactHistory, Integer> 
{

}
