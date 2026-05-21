package com.qamonitor.motor_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class EndpointRequest {

    @NotBlank(message = "El nombre no puede estar vacío")
    private String name;

    @NotBlank(message = "La URL no puede estar vacía")
    // Expresión regular básica para validar que empiece con http:// o https://
    @Pattern(regexp = "^(http|https)://.*$", message = "La URL debe comenzar con http:// o https://")
    private String url;
}