package com.cypherdon.core.repository;

import com.cypherdon.core.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // Basic CRUD operations are auto-implemented by Spring Data JPA
}
