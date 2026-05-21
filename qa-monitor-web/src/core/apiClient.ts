// src/core/apiClient.ts

// URL base de nuestro motor en Spring Boot
const BASE_URL = 'http://localhost:8087/api';

// 1. Tipamos los datos exactamente como los modelamos en Java
export interface ApiEndpoint {
  id: string;
  name: string;
  url: string;
  isActive: boolean;
  createdAt: string;
}

export interface PingLog {
  id: number;
  statusCode: number;
  responseTimeMs: number;
  success: boolean;
  timestamp: string;
}

// 2. Agrupamos las funciones de red
export const api = {
  // Petición GET: Trae todas las APIs registradas
  getEndpoints: async (): Promise<ApiEndpoint[]> => {
    const response = await fetch(`${BASE_URL}/endpoints`);
    if (!response.ok) throw new Error('Error al conectar con el motor de QA');
    const data = await response.json();
    
    // Normalizamos la respuesta de Java: si viene 'active', lo asignamos a 'isActive'
    return data.map((ep: any) => ({
      ...ep,
      isActive: ep.isActive !== undefined ? ep.isActive : ep.active
    }));
  },

  // Petición POST: Registra una nueva API
  createEndpoint: async (name: string, url: string): Promise<ApiEndpoint> => {
    const response = await fetch(`${BASE_URL}/endpoints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url }) // El DTO que espera Java
    });
    if (!response.ok) throw new Error('Error al registrar el endpoint');
    const ep = await response.json();
    return {
      ...ep,
      isActive: ep.isActive !== undefined ? ep.isActive : ep.active
    };
  },

  // Petición POST: Elimina un endpoint por ID
  deleteEndpoint: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/endpoints/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar el endpoint');
  },

  // Update Endpoint: Cambia el estado activo/inactivo
  updateEndpoint: async (id: string, updates: Partial<ApiEndpoint>): Promise<void> => {
    const bodyData = {
      ...updates,
      active: updates.isActive // Mapeo explícito para DTOs de Java
    };

    const response = await fetch(`${BASE_URL}/endpoints/${id}`, {
      method: 'PATCH', // Cambia a 'PUT' si tu backend en Java usa @PutMapping
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
    });
    if (!response.ok) throw new Error('Error al actualizar el endpoint');
  },


  // Petición GET: Trae el historial de latencia de un ID específico
  getPingHistory: async (id: string): Promise<PingLog[]> => {
    const response = await fetch(`${BASE_URL}/analytics/${id}/pings`);
    if (!response.ok) throw new Error('Error al obtener el historial de pings');
    return response.json();
  }
};