package com.qamonitor.motor_backend.repository;

import com.qamonitor.motor_backend.model.ApiEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApiEndpointRepository extends JpaRepository<ApiEndpoint, UUID> {
    // Spring Data JPA crea la consulta SQL automáticamente solo con leer el nombre del método
    List<ApiEndpoint> findByIsActiveTrue();
}