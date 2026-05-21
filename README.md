# QA Monitor

QA Monitor es una solución completa y moderna para la monitorización automatizada de endpoints (APIs) y la visualización de su historial de disponibilidad (pings). El proyecto está dividido en un backend robusto en Spring Boot encargado de las tareas programadas, almacenamiento de datos, junto con un frontend interactivo además de veloz gracias a que esta construido sobre Astro y React.

---

## 📸 
> * <img width="1915" height="1079" alt="image" src="https://github.com/user-attachments/assets/72117758-f00a-4436-86bd-2bb7a9452730" />
> * <img width="1906" height="1068" alt="image" src="https://github.com/user-attachments/assets/7cacd2ae-9758-4a75-8c52-e88c7dd0987c" />
> * <img width="1914" height="1076" alt="image" src="https://github.com/user-attachments/assets/956b36aa-5614-48bb-beae-6927e4a8db7f" />


---

## 🛠️ Arquitectura del Sistema

El proyecto está estructurado de forma desacoplada para facilitar su escalabilidad:

### 🖥️ 1. Backend (`motor-backend`)
Motor principal que expone la API REST, ejecuta pings periódicos a los endpoints activos y gestiona la persistencia de datos.
* **Frecuencia de Monitoreo:** Pings automáticos cada 60 segundos por defecto (`@Scheduled`).
* **Resiliencia:** Uso de `HttpClient` nativo de Java con políticas de timeout de 5 segundos. Considera códigos de estado `200-299` como exitosos.
* **Stack:** Java 17+, Spring Boot, Spring Data JPA (Hibernate), PostgreSQL, Maven.

### 🎨 2. Frontend (`qa-monitor-web`)
Interfaz de usuario optimizada para la velocidad, entrega de contenido estático inmediato y componentes dinámicos reactivos.
* **Stack:** Astro, React, TypeScript, Nanostores (Gestión de estado global), TailwindCSS + DaisyUI (Diseño UI), Recharts (Gráficos interactivos).

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
* **JDK 17** o superior.
* **Node.js** (v18 o superior) y **npm**.
* **PostgreSQL** corriendo localmente o mediante Docker.

---

## ⚙️ Configuración e Instalación

### 🗄️ Paso 1: Base de Datos (PostgreSQL)
Accede a tu consola de PostgreSQL e inicializa la base de datos:

```sql
-- Abrir psql: psql -U postgres
CREATE DATABASE qamonitor_db;
CREATE USER qamonitor_user WITH PASSWORD 'cambiami';
GRANT ALL PRIVILEGES ON DATABASE qamonitor_db TO qamonitor_user;
```

### ☕ Paso 2: Configuración y Arranque del Backend
1. Dirígete a la carpeta del backend y edita el archivo clave de configuración `src/main/resources/application.properties` con tus credenciales:
   ```properties
   server.port=8087
   spring.datasource.url=jdbc:postgresql://localhost:5432/qamonitor_db
   spring.datasource.username=postgres
   spring.datasource.password=TU_CONTRASEÑA
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```
2. Compila y ejecuta el servidor (utilizando Maven instalado o el Wrapper incluido):
   ```bash
   # Opción con Maven Wrapper (Windows)
   .\mvnw.cmd clean package
   .\mvnw.cmd spring-boot:run

   # Opción con Maven Global
   mvn clean package
   mvn spring-boot:run
   ```
   *El servidor backend quedará disponible en:* `http://localhost:8087`

### 🌐 Paso 3: Configuración y Arranque del Frontend
1. Dirígete a la carpeta `qa-monitor-web`.
2. Instala las dependencias y levanta el entorno de desarrollo:
   ```bash
   npm install
   npm run dev
   ```
   *La interfaz web quedará disponible en:* `http://localhost:4321`

---

## 🔌 Referencia de la API REST

**Base URL:** `http://localhost:8087/api`


| Método | Endpoint | Descripción | Payload Ejemplo |
| :--- | :--- | :--- | :--- |
| **GET** | `/endpoints` | Lista todos los endpoints registrados | *Ninguno* |
| **POST** | `/endpoints` | Registra un nuevo endpoint a monitorear | `{"name": "Mi API", "url": "https://api.com"}` |
| **PATCH** | `/endpoints/{id}` | Activa o desactiva el monitoreo | `{"active": false}` |
| **DELETE** | `/endpoints/{id}` | Elimina el endpoint (borrado en cascada) | *Ninguno* |
| **GET** | `/analytics/{id}/pings` | Trae los últimos 50 pings ordenados por fecha | *Ninguno* |

### 💻 Ejemplos Rápidos con `curl`
```bash
# Crear un nuevo endpoint
curl -X POST http://localhost:8087/api/endpoints -H "Content-Type: application/json" -d '{"name":"Google","url":"https://google.com"}'

# Cambiar estado a inactivo
curl -X PATCH http://localhost:8087/api/endpoints/<UUID> -H "Content-Type: application/json" -d '{"active": false}'
```

---

## 📂 Estructura de Archivos Clave

### Backend (`motor-backend`)
* `model/ApiEndpoint.java`: Entidad JPA que representa la API (`id` UUID, `url`, etc.) vinculada en cascada con sus registros de pings.
* `model/PingLog.java`: Almacena el historial de pings (`statusCode`, `responseTimeMs`, `isSuccess`).
* `dto/EndpointRequest.java`: DTO con validaciones `@NotBlank` y expresiones regulares para verificar URLs válidas.
* `service/MonitoringService.java`: El servicio Core que utiliza `@Scheduled(fixedRate = 60000)` para disparar las peticiones.
* `config/CorsConfig.java`: Habilita el intercambio de recursos con el origen del Frontend (`http://localhost:4321`).

### Frontend (`qa-monitor-web`)
* `src/components/EndpointTable.tsx`: Listado principal con interruptores de activación dinámica.
* `src/components/AddEndpointModal.tsx`: Formulario modal de creación con validaciones locales.
* `src/services/apiClient.ts`: Cliente HTTP unificado para interactuar con la API de Spring Boot.
* `src/store/endpointStore.ts`: Gestión de estados de los componentes reactivos vía Nanostores.

---

## 🛠️ Solución de Problemas Comunes (FAQ)

* **Error de CORS o "Failed to Fetch":** Asegúrate de que el puerto de tu Frontend coincide con el permitido en `CorsConfig.java` del backend (por defecto `http://localhost:4321`).
* **Error 500 en DELETE (Violación de FK):** La entidad `ApiEndpoint` ya implementa `CascadeType.REMOVE`. Si persiste, limpia restricciones manuales remanentes en tu base de datos.
* **Recursión Infinita en JSON:** Las entidades ya cuentan con `@JsonManagedReference` y `@JsonBackReference` instalados para evitar bucles circulares de serialización entre el Endpoint y sus Logs.

---

## 📈 Próximas Mejoras & Buenas Prácticas
* [ ] Implementar migraciones de base de datos robustas usando **Flyway** o **Liquibase** en lugar de `ddl-auto=update`.
* [ ] Incorporar capa de seguridad completa con **Spring Security** y tokens **JWT**.
* [ ] Agregar paginación y filtros avanzados en el endpoint de consultas masivas.
* [ ] Añadir soporte de contenedores mediante un archivo `docker-compose.yml` único para la App y PostgreSQL.

---

## 📄 Licencia
Este proyecto está bajo la licencia **MIT**. Siéntete libre de clonarlo, modificarlo y adaptarlo a tus necesidades.
