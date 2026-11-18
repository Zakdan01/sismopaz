# SismoPaz — Especificación Técnica de la API REST

Documento de referencia para el Backend de la plataforma **SismoPaz (Sistema de Información Sísmica La Paz)**.  
Desarrollado sobre **NestJS 10**, **TypeORM** y **PostgreSQL 18** con seguridad criptográfica **JWT (HMAC-SHA256)** y contraseñas **Bcrypt (coste 12)** en cumplimiento con los estándares **ISO/IEC 25010 (RNF03)** y **RF5.01**.

---

## 🌐 Información General

- **URL Base:** `http://localhost:3001/api`
- **Formato de Intercambio:** `application/json`
- **Codificación:** `UTF-8`
- **Datum Geodésico:** `WGS 84 (EPSG:4326)`
- **Polígono Geográfico:** Municipio de La Paz (9 Macrodistritos)

---

## 🔒 Mecanismo de Autenticación y Autorización (RBAC)

Las rutas protegidas requieren el encabezado HTTP estándar:
```http
Authorization: Bearer <token_jwt>
```

- **Expiración de Token:** 60 minutos (RNF03).
- **Lista de Revocación:** Cada token emitido se registra en la tabla `sesiones_usuario`. Al cerrar sesión (`/api/auth/logout`) o suspender una cuenta, la sesión queda revocada inmediatamente.
- **Roles del Sistema (Regla de Rol Único 1 a 1):**
  - `Ciudadano`: Usuario estándar registrado. Consulta catálogo, alertas, reporta sismos y gestiona suscripciones zonales.
  - `Sismólogo`: Personal técnico con matrícula oficial (ej. Observatorio San Calixto). Acceso a catálogo sísmico, emisión de alertas y validación de reportes.
  - `Administrador`: Gobernanza de cuentas, validación de matrículas, habilitación/suspensión y auditoría.

---

## 📋 Catálogo Completo de Endpoints

### 0. Metadatos del Sistema

#### `GET /api`
Devuelve el estado operativo de la API, versión y el índice de rutas disponibles.
- **Acceso:** Público (Sin token).
- **Respuesta (200 OK):**
```json
{
  "sistema": "SismoPaz — Sistema de Información Sísmica La Paz",
  "version": "1.0.0",
  "estado": "Operativo",
  "protocolo": "REST / JSON",
  "autenticacion": "JWT Bearer (HMAC-SHA256, expiración 60m)",
  "roles": ["Ciudadano", "Sismólogo", "Administrador"]
}
```

---

### 1. Módulo de Autenticación (`/api/auth`)

#### `POST /api/auth/register`
Registra un nuevo usuario en la plataforma con rol por defecto `Ciudadano`.
- **Acceso:** Público.
- **Cuerpo de la Petición:**
```json
{
  "nombre": "Carlos",
  "apellidos": "Mamani Quispe",
  "correo": "carlos.mamani@ejemplo.com",
  "password": "Password2026!",
  "telefono": "71987654"
}
```
- **Respuesta (201 Created):**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "usuario": {
    "idUsuario": 4,
    "nombre": "Carlos",
    "apellidos": "Mamani Quispe",
    "correo": "carlos.mamani@ejemplo.com",
    "roles": ["Ciudadano"]
  }
}
```

#### `POST /api/auth/login`
Autentica credenciales y emite un token JWT.
- **Acceso:** Público.
- **Cuerpo de la Petición:**
```json
{
  "correo": "ciudadano@sismopaz.bo",
  "password": "Ciudadano2026!"
}
```
- **Respuesta (200 OK):**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsIn...",
  "usuario": {
    "idUsuario": 3,
    "nombre": "María René",
    "apellidos": "Flores Choque",
    "correo": "ciudadano@sismopaz.bo",
    "telefono": "72009988",
    "roles": ["Ciudadano"]
  }
}
```

#### `POST /api/auth/logout`
Revoca la sesión activa en el servidor y marca el token como revocado.
- **Acceso:** Autenticado (`Bearer Token`).
- **Respuesta (200 OK):**
```json
{
  "mensaje": "Sesión cerrada correctamente"
}
```

---

### 2. Módulo de Usuarios y Perfil (`/api/users`)

#### `GET /api/users/profile`
Obtiene los datos del usuario autenticado, rol único, credenciales técnicas y suscripciones zonales.
- **Acceso:** Autenticado (`Bearer Token`).
- **Respuesta (200 OK):**
```json
{
  "idUsuario": 3,
  "nombre": "María René",
  "apellidos": "Flores Choque",
  "correo": "ciudadano@sismopaz.bo",
  "telefono": "72009988",
  "estado": true,
  "roles": ["Ciudadano"],
  "perfilSismologo": null,
  "suscripciones": [
    {
      "idSuscripcion": 1,
      "idMacrodistrito": 1,
      "macrodistrito": "Cotahuma",
      "activa": true,
      "fechaSuscripcion": "2026-11-18T00:00:00.000Z"
    }
  ]
}
```

#### `PATCH /api/users/profile`
Actualiza datos de contacto personales.
- **Acceso:** Autenticado (`Bearer Token`).
- **Cuerpo de la Petición:**
```json
{
  "nombre": "María René",
  "apellidos": "Flores de Pérez",
  "telefono": "72998811"
}
```
- **Respuesta (200 OK):**
```json
{
  "mensaje": "Perfil actualizado exitosamente",
  "usuario": {
    "idUsuario": 3,
    "nombre": "María René",
    "apellidos": "Flores de Pérez",
    "correo": "ciudadano@sismopaz.bo",
    "telefono": "72998811"
  }
}
```

#### `PATCH /api/users/password`
Cambio seguro de contraseña validando la contraseña actual, nueva contraseña y confirmación.
- **Acceso:** Autenticado (`Bearer Token`).
- **Cuerpo de la Petición:**
```json
{
  "passwordActual": "Ciudadano2026!",
  "passwordNuevo": "NuevoPass2026!",
  "repetirPassword": "NuevoPass2026!"
}
```
- **Validaciones:**
  - `passwordNuevo` debe coincidir exactamente con `repetirPassword`.
  - Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (`@$!%*?&.`).
- **Respuesta (200 OK):**
```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

#### `POST /api/users/solicitar-sismologo`
Permite a un usuario con rol `Ciudadano` postular formalmente al rol `Sismólogo` enviando su matrícula profesional.
- **Acceso:** Autenticado (`Bearer Token`).
- **Cuerpo de la Petición:**
```json
{
  "numeroAcreditacion": "SIS-LP-2026-089",
  "institucionAcreditadora": "Observatorio San Calixto"
}
```
- **Respuesta (201 Created):**
```json
{
  "mensaje": "Solicitud de acreditación enviada correctamente. El Administrador verificará su matrícula técnica.",
  "perfilSismologo": {
    "numeroAcreditacion": "SIS-LP-2026-089",
    "institucionAcreditadora": "Observatorio San Calixto",
    "estadoSolicitud": "PENDIENTE",
    "vigente": false
  }
}
```

---

### 3. Módulo Geográfico y Suscripciones (`/api/macrodistritos` y `/api/users/subscriptions`)

#### `GET /api/macrodistritos`
Listado de los 9 macrodistritos del Municipio de La Paz.
- **Acceso:** Público.
- **Respuesta (200 OK):**
```json
[
  { "idMacrodistrito": 1, "nombre": "Cotahuma", "idMunicipio": 1 },
  { "idMacrodistrito": 2, "nombre": "Max Paredes", "idMunicipio": 1 },
  { "idMacrodistrito": 3, "nombre": "Periférica", "idMunicipio": 1 },
  { "idMacrodistrito": 4, "nombre": "San Antonio", "idMunicipio": 1 },
  { "idMacrodistrito": 5, "nombre": "Sur", "idMunicipio": 1 },
  { "idMacrodistrito": 6, "nombre": "Mallasa", "idMunicipio": 1 },
  { "idMacrodistrito": 7, "nombre": "Centro", "idMunicipio": 1 },
  { "idMacrodistrito": 8, "nombre": "Hampaturi", "idMunicipio": 1 },
  { "idMacrodistrito": 9, "nombre": "Zongo", "idMunicipio": 1 }
]
```

#### `POST /api/users/subscriptions`
Suscribe al usuario a un macrodistrito para alertas zonales tempranas (RF2.03 / HU07).
- **Acceso:** Autenticado (`Bearer Token`).
- **Cuerpo de la Petición:**
```json
{
  "idMacrodistrito": 5
}
```
- **Respuesta (201 Created):**
```json
{
  "mensaje": "Suscripción zonal agregada exitosamente",
  "suscripcion": {
    "idSuscripcion": 3,
    "idUsuario": 3,
    "idMacrodistrito": 5,
    "activa": true
  }
}
```

#### `DELETE /api/users/subscriptions/:id`
Elimina una suscripción zonal previamente creada.
- **Acceso:** Autenticado (`Bearer Token`).
- **Respuesta (200 OK):**
```json
{
  "mensaje": "Suscripción zonal eliminada correctamente"
}
```

---

### 4. Módulo de Gobernanza y Administración (`/api/admin`)

*Todos los endpoints de este módulo requieren token JWT con rol `Administrador`.*

#### `GET /api/admin/users`
Listado general de usuarios registrados con soporte de búsqueda textual.
- **Parámetros Query:**
  - `search` (opcional): Filtro por nombre, apellido o correo electrónico.
  - `role` (opcional): Filtro por nombre de rol (`Ciudadano`, `Sismólogo`, `Administrador`).
- **Respuesta (200 OK):**
```json
[
  {
    "idUsuario": 2,
    "nombre": "Dr. Roberto",
    "apellidos": "Guzmán Quispe",
    "correo": "sismologo@sismopaz.bo",
    "telefono": "71556677",
    "estado": true,
    "fechaRegistro": "2026-11-18T00:00:00.000Z",
    "roles": ["Sismólogo"],
    "perfilSismologo": {
      "numeroAcreditacion": "SIS-LP-2026-001",
      "institucionAcreditadora": "Observatorio San Calixto",
      "vigente": true,
      "estadoSolicitud": "APROBADA",
      "fechaVerificacion": "2026-11-18"
    }
  }
]
```

#### `GET /api/admin/roles`
Catálogo de roles del sistema.
- **Respuesta (200 OK):**
```json
[
  { "idRol": 1, "nombre": "Ciudadano", "descripcion": "Usuario registrado estándar" },
  { "idRol": 2, "nombre": "Sismólogo", "descripcion": "Personal técnico acreditado para operaciones sísmicas" },
  { "idRol": 3, "nombre": "Administrador", "descripcion": "Gestión de cuentas y configuración" }
]
```

#### `GET /api/admin/solicitudes-sismologo`
Bandeja de ciudadanos con solicitudes de acreditación en estado `PENDIENTE`.
- **Respuesta (200 OK):**
```json
[
  {
    "idUsuario": 3,
    "nombre": "María René",
    "apellidos": "Flores Choque",
    "correo": "ciudadano@sismopaz.bo",
    "telefono": "72009988",
    "roles": ["Ciudadano"],
    "numeroAcreditacion": "SIS-LP-2026-089",
    "institucionAcreditadora": "Observatorio San Calixto",
    "estadoSolicitud": "PENDIENTE"
  }
]
```

#### `POST /api/admin/solicitudes/:id/aprobar`
Valida la matrícula técnica, aprueba la solicitud y transfiere al usuario a rol exclusivo `Sismólogo` (eliminando `Ciudadano`).
- **Respuesta (201 Created):**
```json
{
  "mensaje": "Solicitud aprobada con éxito. El usuario María René Flores Choque ahora cuenta con rol Sismólogo.",
  "roles": ["Sismólogo"],
  "perfilSismologo": {
    "numeroAcreditacion": "SIS-LP-2026-089",
    "institucionAcreditadora": "Observatorio San Calixto",
    "estadoSolicitud": "APROBADA",
    "vigente": true
  }
}
```

#### `POST /api/admin/solicitudes/:id/rechazar`
Rechaza la solicitud de acreditación. El usuario permanece con rol `Ciudadano`.
- **Respuesta (201 Created):**
```json
{
  "mensaje": "La solicitud de acreditación del usuario María René ha sido rechazada. Mantiene su rol actual.",
  "estadoSolicitud": "RECHAZADA"
}
```

#### `PATCH /api/admin/users/:id/status`
Habilita o suspende una cuenta de usuario. Si se suspende, revoca todas sus sesiones activas de inmediato.
- **Cuerpo de la Petición:**
```json
{
  "estado": false
}
```
- **Respuesta (200 OK):**
```json
{
  "mensaje": "Cuenta de usuario suspendida y sesiones revocadas",
  "estado": false
}
```

#### `POST /api/admin/users/:id/assign-role`
Asignación o cambio directo de rol garantizando la regla de rol único (reemplaza cualquier rol previo).
- **Cuerpo de la Petición:**
```json
{
  "idRol": 2,
  "numeroAcreditacion": "SIS-LP-2026-102",
  "institucionAcreditadora": "Observatorio San Calixto"
}
```
- **Respuesta (201 Created):**
```json
{
  "mensaje": "Rol Sismólogo asignado exitosamente al usuario (rol único)",
  "roles": ["Sismólogo"]
}
```

---

## 🛑 Códigos de Estado HTTP Utilizados

| Código | Descripción | Casos de Uso |
|---|---|---|
| `200 OK` | Operación exitosa | Consultas GET, actualizaciones PATCH |
| `201 Created` | Recurso creado exitosamente | Registro, login, suscripciones, solicitudes |
| `400 Bad Request` | Parámetros inválidos | Contraseñas no coinciden, campos faltantes |
| `401 Unauthorized` | Autenticación requerida | Token no enviado, expirado (>60m) o inválido |
| `403 Forbidden` | Acceso denegado por rol | Usuario sin permisos de Administrador |
| `404 Not Found` | Recurso inexistente | Usuario, rol o macrodistrito no encontrado |
| `409 Conflict` | Conflicto de unicidad | Correo electrónico ya registrado previamente |
