package com.qamonitor.motor_backend.controller;

import com.qamonitor.motor_backend.model.ApiEndpoint;
import com.qamonitor.motor_backend.model.PingLog;
import com.qamonitor.motor_backend.repository.ApiEndpointRepository;
import com.qamonitor.motor_backend.repository.PingLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final ApiEndpointRepository endpointRepository;
    private final PingLogRepository pingLogRepository;

    // Ruta GET: Trae los últimos 50 pings de un ID específico
    @GetMapping("/{id}/pings")
    public ResponseEntity<List<PingLog>> getPingHistory(@PathVariable UUID id) {
        return endpointRepository.findById(id)
                .map(endpoint -> {
                    List<PingLog> history = pingLogRepository.findTop50ByEndpointOrderByTimestampDesc(endpoint);
                    return ResponseEntity.ok(history);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}