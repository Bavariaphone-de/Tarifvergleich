package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerInvitation;

@Repository
public interface CustomerInvitationRepository extends JpaRepository<CustomerInvitation, Integer> {

}
