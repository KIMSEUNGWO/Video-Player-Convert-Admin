package com.convert.admin.jours.jparepository;

import com.convert.admin.jours.entity.Admin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminJpaRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUsername(String username);
}
