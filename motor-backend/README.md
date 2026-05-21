# QA Monitor — Backend (Spring Boot)

QA Monitor es una aplicación para monitorizar endpoints y visualizar el historial de pings. El frontend (proyecto separado) está hecho con Astro + React; este repositorio contiene el backend en Spring Boot que expone la API REST, ejecuta pings periódicos a los endpoints activos y guarda el historial en PostgreSQL.

Propósito
- Registrar endpoints (APIs) a monitorear.
- Ejecutar pings periódicos (cada 60s por defecto), medir latencia y almacenar resultados.
- Permitir administrar endpoints (activar/desactivar, eliminar).
- Proveer datos históricos para que el frontend muestre gráficos y tablas.

Qué es el frontend
- Proyecto independiente (no incluido aquí) construido con:
  - Astro + React + TypeScript
  - Nanostores (estado)
  - TailwindCSS + DaisyUI (estilos)
  - Recharts (gráficos)
- Archivos referenciados en la documentación (ej.: `apiClient.ts`, `EndpointTable.tsx`, `AddEndpointModal.tsx`, `endpointStore.ts`, `src/pages/endpoint/[id].astro`) pertenecen al frontend.

Tecnologías (Backend)
- Java 17+
- Spring Boot
- Spring Data JPA (Hibernate)
- PostgreSQL
- Maven (mvn) / Maven Wrapper (mvnw)

Requisitos previos
- JDK 17 o superior
- Maven o usar el wrapper incluido (`mvnw.cmd` en Windows)
- PostgreSQL en ejecución (o Docker)
- (Opcional) curl / jq para pruebas rápidas

Configuración de PostgreSQL (ejemplo)

1. Crear la base de datos y (opcional) usuario:

```powershell
# Abrir psql como postgres
psql -U postgres
# Dentro de psql
CREATE DATABASE qamonitor_db;
CREATE USER qamonitor_user WITH PASSWORD 'cambiami';
GRANT ALL PRIVILEGES ON DATABASE qamonitor_db TO qamonitor_user;
\q
```

2. Editar `src/main/resources/application.properties` para poner la URL, usuario y contraseña:

- Por defecto en el repo:
  - `spring.datasource.url=jdbc:postgresql://localhost:5432/qamonitor_db`
  - `spring.datasource.username=postgres`
  - `spring.datasource.password=72200571@`

Ajusta esos valores a tu entorno.

Archivo de configuración clave
- `src/main/resources/application.properties`
  - `server.port=8087`
  - `spring.datasource.*` (url, username, password)
  - `spring.jpa.hibernate.ddl-auto=update` (útil en desarrollo; considerar Flyway/Liquibase en producción)
  - `spring.jpa.show-sql=true`

Ejecutar la aplicación (Windows PowerShell)

Con Maven Wrapper incluido:

```powershell
# Compilar
.\mvnw.cmd clean package
# Ejecutar
.\mvnw.cmd spring-boot:run
```

Con Maven instalado:

```powershell
mvn clean package
mvn spring-boot:run
```

Ejecutar jar:

```powershell
# Después de package
java -jar target\motor-backend-0.0.1-SNAPSHOT.jar
```

API (resumen)

Base URL por defecto: http://localhost:8087/api

- GET /api/endpoints
  - Lista todos los endpoints.
- POST /api/endpoints
  - Crea un endpoint.
  - Payload: { "name": "...", "url": "https://..." }
  - Validaciones: `name` y `url` no vacíos; `url` debe empezar con http:// o https://
- PATCH /api/endpoints/{id}
  - Actualiza solo el estado activo: { "active": true|false }
- DELETE /api/endpoints/{id}
  - Elimina el endpoint (los ping_logs relacionados se eliminan en cascada según la entidad).
- GET /api/analytics/{id}/pings
  - Trae los últimos 50 pings para el endpoint (ordenados por timestamp desc).

Modelos y archivos clave (ubicación en el repo)
- `src/main/java/com/qamonitor/motor_backend/model/ApiEndpoint.java`
  - Entidad JPA `api_endpoints` con `id` (UUID), `name`, `url`, `isActive`, `createdAt`, `pingLogs`.
- `src/main/java/com/qamonitor/motor_backend/model/PingLog.java`
  - Entidad JPA `ping_logs` con `id`, `endpoint` (ManyToOne), `statusCode`, `responseTimeMs`, `isSuccess`, `timestamp`.
- `src/main/java/com/qamonitor/motor_backend/dto/EndpointRequest.java`
  - DTO para crear endpoint con validaciones (NotBlank y regex URL).
- `src/main/java/com/qamonitor/motor_backend/controller/EndpointController.java`
  - Controlador REST para operaciones CRUD.
- `src/main/java/com/qamonitor/motor_backend/controller/AnalyticsController.java`
  - Ruta para obtener historial de pings.
- `src/main/java/com/qamonitor/motor_backend/service/MonitoringService.java`
  - Servicio programado que ejecuta pings cada 60s y guarda `PingLog`.
- `src/main/java/com/qamonitor/motor_backend/config/CorsConfig.java`
  - Configuración CORS que permite `http://localhost:4321` (puerto por defecto del frontend Astro en dev).

Comportamiento del monitoreo
- `MonitoringService` usa `HttpClient` de Java con `connectTimeout` de 5s.
- Considera success codes 200-299.
- Guarda `PingLog` con código, tiempo (ms), y éxito.
- Programación: `@Scheduled(fixedRate = 60000)` (60s).

Ejemplos curl

Listar endpoints:
```bash
curl http://localhost:8087/api/endpoints
```

Crear endpoint:
```bash
curl -X POST http://localhost:8087/api/endpoints -H "Content-Type: application/json" -d '{"name":"Mi API","url":"https://example.com/"}'
```

Actualizar activo/inactivo:
```bash
curl -X PATCH http://localhost:8087/api/endpoints/<UUID> -H "Content-Type: application/json" -d '{"active": false}'
```

Borrar endpoint:
```bash
curl -X DELETE http://localhost:8087/api/endpoints/<UUID>
```

Obtener últimos pings:
```bash
curl http://localhost:8087/api/analytics/<UUID>/pings
```

Solución de problemas comunes
- CORS / "Failed to fetch": Verifica `CorsConfig.java` y que el frontend use `http://localhost:4321`. Si el frontend está en otro origen, añade/ajusta `allowedOrigins`.
- DELETE -> 500 (violación FK): La entidad `ApiEndpoint` ya declara `cascade = CascadeType.REMOVE, orphanRemoval = true`. Si persisten errores, revisa constraints existentes en la base de datos o triggers que bloqueen la eliminación.
- JSON recursivo: Las entidades usan `@JsonManagedReference` y `@JsonBackReference` para evitar recursión en la serialización.
- PATCH no aplicado: Asegúrate de mandar `{ "active": <boolean> }` y usar `PATCH /api/endpoints/{id}`.
- Timeout / fallos de conexión en pings: `HttpClient` tiene `connectTimeout` de 5s; si las APIs son lentas aumenta el timeout.

Buenas prácticas para producción
- Reemplazar `spring.jpa.hibernate.ddl-auto=update` por migraciones con Flyway o Liquibase.
- Añadir autenticación/autorización (Spring Security + JWT).
- Agregar métricas (Prometheus / actuator) y alertas.
- Tests: unitarios e integración (MockMvc, Testcontainers para DB).

Mejoras sugeridas
- Endpoint para editar `name` y `url` (PUT/PATCH completo).
- Paginación y filtros en `GET /api/endpoints`.
- Autenticación (JWT) y permisos por usuario.
- Historial y auditoría (quién cambió qué y cuándo).
- Docker Compose para levantar PostgreSQL + app localmente.

Cómo puedo ayudarte
- Puedo crear el README como archivo en el repo (ya hecho).
- Puedo implementar mejoras en el backend a tu pedido (ej.: editar endpoint, paginación, JWT, Docker Compose, Flyway, tests).
- Indícame qué prefieres que implemente a continuación.

Licencia
- Añade aquí la licencia que prefieras (MIT, Apache 2.0, GPL, etc.) si compartes el proyecto.

---

Archivo creado automáticamente a partir del código existente en este repo y las notas del proyecto.
