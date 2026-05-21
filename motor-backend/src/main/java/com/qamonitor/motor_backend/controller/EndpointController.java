package com.qamonitor.motor_backend.controller;

import com.qamonitor.motor_backend.dto.EndpointRequest;
import com.qamonitor.motor_backend.model.ApiEndpoint;
import com.qamonitor.motor_backend.repository.ApiEndpointRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/endpoints")
@RequiredArgsConstructor
public class EndpointController {

    private final ApiEndpointRepository repository;

    @GetMapping
    public List<ApiEndpoint> getAllEndpoints() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<ApiEndpoint> createEndpoint(@Valid @RequestBody EndpointRequest request) {
        ApiEndpoint newEndpoint = new ApiEndpoint();
        newEndpoint.setName(request.getName());
        newEndpoint.setUrl(request.getUrl());

        ApiEndpoint saved = repository.save(newEndpoint);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEndpoint(@PathVariable UUID id) {
        return repository.findById(id)
                .map(endpoint -> {
                    repository.delete(endpoint);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiEndpoint> updateEndpoint(
            @PathVariable UUID id,
            @RequestBody EndpointStatusRequest request
    ) {
        return repository.findById(id)
                .map(endpoint -> {
                    if (request.getActive() != null) {
                        endpoint.setActive(request.getActive());
                    }
                    ApiEndpoint updated = repository.save(endpoint);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class EndpointStatusRequest {
        private Boolean active;

        public Boolean getActive() {
            return active;
        }

        public void setActive(Boolean active) {
            this.active = active;
        }
    }
}