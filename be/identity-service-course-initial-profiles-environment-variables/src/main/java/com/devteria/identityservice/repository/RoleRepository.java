package com.devteria.identityservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identityservice.entity.Role;

import java.util.Collection;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, String> {
    Set<Role> findByNameIn(Collection<String> names);
}
