package com.qamonitor.motor_backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ping_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "endpoint_id", nullable = false)
    @JsonBackReference
    private ApiEndpoint endpoint;

    @Column(nullable = false)
    private int statusCode;

    @Column(nullable = false)
    private long responseTimeMs;

    @Column(nullable = false)
    private boolean isSuccess;

    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}