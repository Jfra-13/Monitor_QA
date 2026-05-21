package com.qamonitor.motor_backend.service;

import com.qamonitor.motor_backend.model.ApiEndpoint;
import com.qamonitor.motor_backend.model.PingLog;
import com.qamonitor.motor_backend.repository.ApiEndpointRepository;
import com.qamonitor.motor_backend.repository.PingLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor // Lombok inyecta automáticamente los repositorios
@Slf4j // Lombok nos da la variable 'log' para imprimir en consola
public class MonitoringService {

    private final ApiEndpointRepository endpointRepository;
    private final PingLogRepository pingLogRepository;

    // Creamos un cliente HTTP que se rendirá si una API tarda más de 5 segundos
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    // @Scheduled indica cada cuánto se ejecuta.
    // fixedRate = 60000 significa 60,000 milisegundos (1 minuto).
    @Scheduled(fixedRate = 60000)
    public void runHealthChecks() {
        log.info("Iniciando ciclo de monitoreo de APIs...");

        // 1. Buscamos en PostgreSQL todas las APIs que estén activas
        List<ApiEndpoint> endpoints = endpointRepository.findByIsActiveTrue();

        if (endpoints.isEmpty()) {
            log.info("No hay APIs registradas para monitorear.");
            return;
        }

        // 2. Iteramos sobre cada URL para hacerle la prueba de QA
        for (ApiEndpoint endpoint : endpoints) {
            checkEndpoint(endpoint);
        }

        log.info("Ciclo de monitoreo finalizado.");
    }

    private void checkEndpoint(ApiEndpoint endpoint) {
        long startTime = System.currentTimeMillis();
        int statusCode = 500; // Por defecto asumimos fallo total
        boolean isSuccess = false;

        try {
            // Preparamos la petición HTTP GET
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint.getUrl()))
                    .GET()
                    .build();

            // Ejecutamos la petición
            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());

            statusCode = response.statusCode();
            // Consideramos éxito cualquier código entre 200 y 299
            isSuccess = statusCode >= 200 && statusCode < 300;

        } catch (Exception e) {
            log.error("Fallo de conexión al endpoint: {} - Error: {}", endpoint.getName(), e.getMessage());
            // Si la API no existe o hay timeout, statusCode se queda en 500 y Success en false
        }

        // Calculamos cuánto tardó en milisegundos
        long responseTime = System.currentTimeMillis() - startTime;

        // 3. Guardamos el resultado histórico en la base de datos
        PingLog logEntry = new PingLog();
        logEntry.setEndpoint(endpoint);
        logEntry.setStatusCode(statusCode);
        logEntry.setResponseTimeMs(responseTime);
        logEntry.setSuccess(isSuccess);

        pingLogRepository.save(logEntry);

        log.info("Ping a [{}] | Estado: {} | Tiempo: {}ms | Éxito: {}",
                endpoint.getName(), statusCode, responseTime, isSuccess);
    }
}