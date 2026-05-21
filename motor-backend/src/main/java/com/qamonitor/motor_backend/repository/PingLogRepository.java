package com.qamonitor.motor_backend.repository;

import com.qamonitor.motor_backend.model.PingLog;
import com.qamonitor.motor_backend.model.ApiEndpoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PingLogRepository extends JpaRepository<PingLog, Long> {
    // Método personalizado para QA: Traer los últimos 50 pings de una API específica ordenados por el más reciente
    List<PingLog> findTop50ByEndpointOrderByTimestampDesc(ApiEndpoint endpoint);
}