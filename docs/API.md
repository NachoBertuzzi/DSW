# Documentación de la API

API REST del sistema de registro inteligente de entrenamiento deportivo.

## Información general

- **URL local:** `http://localhost:3000`
- **Formato:** JSON
- **Content-Type:** `application/json`
- **Autenticación:** Bearer JWT en las rutas que la requieren.
- **Prefijo principal:** `/api`

Para iniciar la API:

```bash
cd backend
npm install
node server.js
```

La API necesita un archivo `backend/.env` configurado y una base MySQL disponible. Ver la guía general de instalación en [`README.md`](../README.md).

## Autenticación

Las rutas protegidas esperan este header:

```http
Authorization: Bearer <token>
```

El token se obtiene mediante el login de un deportista o entrenador. La duración configurada es de dos horas.

### Roles disponibles

- `deportista`: puede consultar recursos, crear sus entrenamientos, consultar sus asignaciones y cambiar el estado de una asignación.
- `entrenador`: puede consultar recursos, crear y administrar entrenamientos, crear y eliminar asignaciones y administrar localidades.

El registro y los dos endpoints específicos de login son públicos. Las operaciones restantes requieren JWT y, según la operación, uno de los roles anteriores. Las modificaciones y eliminaciones de cuentas están limitadas al DNI del usuario autenticado.

## Respuestas y errores

Las respuestas exitosas de listados y recursos suelen utilizar esta estructura:

```json
{
  "data": {}
}
```

Los errores pueden utilizar `message` o `mensaje`, según el controlador:

```json
{
  "mensaje": "Descripción del error"
}
```

Los códigos más frecuentes son:

| Código | Significado                                   |
| -----: | --------------------------------------------- |
|  `200` | Operación exitosa.                            |
|  `201` | Recurso creado.                               |
|  `204` | Operación exitosa sin contenido.              |
|  `400` | Solicitud inválida o campos faltantes.        |
|  `401` | Credenciales incorrectas o token inválido.    |
|  `403` | Falta el token requerido.                     |
|  `404` | Recurso no encontrado.                        |
|  `500` | Error interno del servidor.                   |
|  `502` | Error al comunicarse con un servicio externo. |
|  `503` | Servicio no configurado.                      |

---

# Deportistas

Ruta base: `/api/deportistas`

## Listar deportistas

**GET** `/api/deportistas`

Devuelve todos los deportistas.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": [
    {
      "dni": "12345678",
      "nombre": "Juan",
      "apellido": "Perez",
      "usuario": "juanp",
      "email": "juan@email.com"
    }
  ]
}
```

## Consultar un deportista

**GET** `/api/deportistas/:dni`

Devuelve un deportista identificado por su DNI.

### Parámetros

| Parámetro | Tipo   | Descripción         |
| --------- | ------ | ------------------- |
| `dni`     | string | DNI del deportista. |

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": {
    "dni": "12345678",
    "nombre": "Juan",
    "apellido": "Perez",
    "usuario": "juanp",
    "email": "juan@email.com"
  }
}
```

### Posibles errores

- `404`: `Deportista no encontrado`.

## Crear deportista

**POST** `/api/deportistas`

Crea un nuevo deportista. La contraseña se almacena encriptada.

### Autenticación

No requiere autenticación. Es una ruta pública de registro.

### Body

```json
{
  "dni": "12345678",
  "nombre": "Juan",
  "apellido": "Perez",
  "usuario": "juanp",
  "email": "juan@email.com",
  "contrasena": "123456",
  "fecha_nacimiento": "2000-01-01",
  "altura": 180,
  "peso": 75,
  "telefono": "3415550000",
  "localidadCodPostal": "2000",
  "localidadNombre": "Rosario",
  "localidadProvincia": "Santa Fe"
}
```

Los campos de localidad son opcionales. Si se envía `localidadCodPostal` y no existe, la API crea la localidad.

### Respuesta exitosa

`201 Created`

```json
{
  "message": "Deportista creado",
  "data": {
    "dni": "12345678",
    "nombre": "Juan",
    "apellido": "Perez"
  }
}
```

### Posibles errores

- `400`: el DNI ya existe.
- `500`: error de conexión o persistencia.

## Iniciar sesión como deportista

**POST** `/api/deportistas/login`

Autentica un deportista mediante usuario o email.

### Autenticación

No requiere token.

### Body

```json
{
  "usuario": "juanp",
  "contrasena": "123456"
}
```

También se aceptan `email`, `mail`, `password` o `contraseña` como nombres alternativos según el cliente.

### Respuesta exitosa

`200 OK`

```json
{
  "deportista": {
    "dni": "12345678",
    "nombre": "Juan",
    "usuario": "juanp",
    "email": "juan@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Posibles errores

- `400`: `Faltan credenciales`.
- `401`: `Credenciales incorrectas`.
- `500`: error del servidor.

## Actualizar deportista

**PUT** `/api/deportistas/:dni`

Actualiza los datos enviados del deportista.

### Autenticación

Requiere Bearer JWT.

### Body

Se pueden enviar los campos aceptados por el alta. Por ejemplo:

```json
{
  "apellido": "Actualizado",
  "altura": 182,
  "peso": 80
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "message": "Deportista actualizado",
  "data": {}
}
```

### Posibles errores

- `403`: token requerido.
- `401`: token inválido o expirado.
- `404`: deportista no encontrado.

## Eliminar deportista

**DELETE** `/api/deportistas/:dni`

Elimina la cuenta después de validar la contraseña. También elimina sus asignaciones y entrenamientos relacionados.

### Autenticación

Requiere Bearer JWT.

### Body

```json
{
  "dni": "12345678",
  "contrasena": "123456"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "mensaje": "Cuenta eliminada correctamente"
}
```

### Posibles errores

- `400`: falta el DNI o la contraseña.
- `401`: contraseña incorrecta o token inválido.
- `403`: token requerido.
- `404`: deportista no encontrado.
- `500`: error al eliminar la cuenta.

## Asignar ejercicios directamente

**POST** `/api/deportistas/asignarEjercicio`

Actualiza los ejercicios asignados a un deportista.

### Autenticación

Requiere Bearer JWT.

### Body

```json
{
  "deportista": "12345678",
  "entrenador": "87654321",
  "fechaEntrenamiento": "2026-09-09",
  "horaEntrenamiento": "08:30",
  "ejercicios": [
    {
      "nombre": "Press de banca",
      "grupo": "Pecho",
      "series": 3
    }
  ]
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "mensaje": "Ejercicios asignados",
  "data": {}
}
```

### Posibles errores

- `400`: faltan datos o `ejercicios` no es un array con elementos.
- `401`: token inválido.
- `403`: token requerido.
- `404`: deportista no encontrado.
- `500`: error del servidor.

## Eliminar deportista mediante body

**POST** `/api/deportistas/eliminar`

Realiza la misma operación de eliminación utilizando el DNI dentro del body.

### Autenticación

Requiere Bearer JWT.

### Body

```json
{
  "dni": "12345678",
  "contrasena": "123456"
}
```

La respuesta y los errores son los mismos que en `DELETE /api/deportistas/:dni`.

---

# Entrenadores

Ruta base: `/api/entrenadores`

## Listar entrenadores

**GET** `/api/entrenadores`

Devuelve todos los entrenadores.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": [
    {
      "dni": "87654321",
      "nombre": "Ana",
      "apellido": "Gomez",
      "usuario": "anag",
      "email": "ana@email.com",
      "especialidad": "Fuerza"
    }
  ]
}
```

## Consultar entrenador

**GET** `/api/entrenadores/:dni`

Devuelve un entrenador por DNI.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": {
    "dni": "87654321",
    "nombre": "Ana",
    "apellido": "Gomez",
    "especialidad": "Fuerza"
  }
}
```

### Posibles errores

- `404`: `Entrenador no encontrado`.

## Crear entrenador

**POST** `/api/entrenadores`

Crea un entrenador.

### Autenticación

No requiere autenticación. Es una ruta pública de registro.

### Body

```json
{
  "dni": "87654321",
  "nombre": "Ana",
  "apellido": "Gomez",
  "usuario": "anag",
  "email": "ana@email.com",
  "contrasena": "123456",
  "especialidad": "Fuerza",
  "tel": "3415550000"
}
```

También se acepta `mail` como alternativa a `email`.

### Respuesta exitosa

`201 Created`

```json
{
  "message": "Entrenador creado",
  "data": {}
}
```

### Posibles errores

- `500`: error de persistencia o datos incompatibles con la base.

## Iniciar sesión como entrenador

**POST** `/api/entrenadores/login`

Autentica un entrenador mediante usuario o email.

### Autenticación

No requiere token.

### Body

```json
{
  "usuario": "anag",
  "contrasena": "123456"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "entrenador": {
    "dni": "87654321",
    "nombre": "Ana",
    "usuario": "anag",
    "email": "ana@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Posibles errores

- `400`: `Faltan credenciales`.
- `401`: `Credenciales incorrectas`.
- `500`: error del servidor.

## Actualizar entrenador

**PUT** `/api/entrenadores/:dni`

Actualiza los campos enviados del entrenador.

### Autenticación

Requiere Bearer JWT de un entrenador y solo permite modificar su propio DNI.

### Body

```json
{
  "apellido": "Actualizado",
  "especialidad": "Movilidad",
  "tel": "3415551111"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "message": "Entrenador actualizado",
  "data": {}
}
```

### Posibles errores

- `404`: entrenador no encontrado.

## Actualizar entrenador parcialmente

**PATCH** `/api/entrenadores/:dni`

Realiza la misma actualización utilizando PATCH.

### Autenticación

Requiere Bearer JWT de un entrenador y solo permite modificar su propio DNI.

### Body, respuesta y errores

Utiliza el mismo formato de `PUT /api/entrenadores/:dni`.

## Eliminar entrenador

**DELETE** `/api/entrenadores/:dni`

Elimina el entrenador después de comprobar su contraseña. Sus entrenamientos quedan sin entrenador y se eliminan sus asignaciones.

### Autenticación

Requiere Bearer JWT de un entrenador y solo permite eliminar su propio DNI.

### Body

```json
{
  "contrasena": "123456"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "mensaje": "Cuenta eliminada correctamente"
}
```

### Posibles errores

- `400`: se requiere la contraseña.
- `401`: contraseña incorrecta.
- `404`: entrenador no encontrado.
- `500`: error interno del servidor.

---

# Entrenamientos

Ruta base: `/api/entrenamientos`

## Listar entrenamientos

**GET** `/api/entrenamientos`

Devuelve los entrenamientos ordenados por ID descendente, incluyendo datos básicos del deportista y entrenador relacionados.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": [
    {
      "id": 123,
      "fechaEntrenamiento": "2026-09-09",
      "horaEntrenamiento": "08:30",
      "deportista": {
        "dni": "12345678",
        "nombre": "Juan"
      },
      "entrenador": {
        "dni": "87654321",
        "nombre": "Ana"
      }
    }
  ]
}
```

## Consultar entrenamiento

**GET** `/api/entrenamientos/:id`

Devuelve un entrenamiento por ID con sus relaciones.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": {
    "id": 123,
    "fechaEntrenamiento": "2026-09-09",
    "horaEntrenamiento": "08:30",
    "deportista": {},
    "entrenador": {}
  }
}
```

### Posibles errores

- `404`: `Entrenamiento no encontrado`.

## Crear entrenamiento

**POST** `/api/entrenamientos`

Crea un entrenamiento relacionado obligatoriamente con un deportista y opcionalmente con un entrenador.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Body

```json
{
  "fechaEntrenamiento": "2026-09-09",
  "horaEntrenamiento": "08:30",
  "deportista": {
    "dni": "12345678"
  },
  "entrenador": {
    "dni": "87654321"
  }
}
```

`horaEntrenamiento` y `entrenador` pueden omitirse. El formato esperado de hora es `HH:mm`.

### Respuesta exitosa

`201 Created`

```json
{
  "message": "Entrenamiento creado",
  "data": {
    "id": 123,
    "fechaEntrenamiento": "2026-09-09",
    "horaEntrenamiento": "08:30",
    "deportista": {},
    "entrenador": {}
  }
}
```

### Posibles errores

- `500`: error de persistencia o referencias inexistentes.

## Actualizar entrenamiento

**PUT** `/api/entrenamientos/:id`

Actualiza los campos enviados del entrenamiento.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Body

```json
{
  "horaEntrenamiento": "09:45"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "message": "Entrenamiento actualizado",
  "data": {}
}
```

### Posibles errores

- `404`: entrenamiento no encontrado.

## Actualizar entrenamiento parcialmente

**PATCH** `/api/entrenamientos/:id`

Realiza la misma actualización utilizando PATCH.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Body, respuesta y errores

Utiliza el mismo formato de `PUT /api/entrenamientos/:id`.

## Eliminar entrenamiento

**DELETE** `/api/entrenamientos/:id`

Elimina un entrenamiento por ID.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "message": "Entrenamiento eliminado"
}
```

### Posibles errores

- `404`: entrenamiento no encontrado.

---

# Asignaciones de entrenamiento

Ruta base: `/api/asignaciones-entrenamientos`

Una asignación relaciona un entrenador, un deportista y un entrenamiento. Los estados permitidos son:

- `pendiente`
- `en_progreso`
- `completado`
- `cancelado`

## Crear asignación

**POST** `/api/asignaciones-entrenamientos`

Crea una asignación entre entidades existentes.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Body

```json
{
  "entrenadorDni": "87654321",
  "deportistaDni": "12345678",
  "entrenamientoId": 123,
  "fecha": "2026-09-09",
  "notas": "Asignación de integración"
}
```

`fecha` y `notas` son opcionales. `notas` admite hasta 1000 caracteres.

### Respuesta exitosa

`201 Created`

```json
{
  "data": {
    "id": "uuid-de-la-asignacion",
    "entrenador": {},
    "deportista": {},
    "entrenamiento": {},
    "fecha": "2026-09-09",
    "notas": "Asignación de integración",
    "estado": "pendiente"
  }
}
```

### Posibles errores

- `400`: faltan `entrenadorDni`, `deportistaDni` o `entrenamientoId`.
- `400`: `entrenamientoId` no es numérico.
- `400`: fecha inválida.
- `400`: notas no es texto o supera 1000 caracteres.
- `404`: entrenador, deportista o entrenamiento no encontrado.
- `500`: error al crear la asignación.

## Listar asignaciones por entrenador

**GET** `/api/asignaciones-entrenamientos/entrenadores/:dni`

Devuelve las asignaciones de un entrenador.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": [
    {
      "id": "uuid-de-la-asignacion",
      "entrenador": {},
      "deportista": {},
      "entrenamiento": {},
      "estado": "pendiente"
    }
  ]
}
```

### Posibles errores

- `500`: error al listar asignaciones por entrenador.

## Listar asignaciones por deportista

**GET** `/api/asignaciones-entrenamientos/deportistas/:dni`

Devuelve las asignaciones de un deportista.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": [
    {
      "id": "uuid-de-la-asignacion",
      "entrenador": {},
      "deportista": {},
      "entrenamiento": {},
      "notas": "Asignación de integración",
      "estado": "pendiente"
    }
  ]
}
```

### Posibles errores

- `500`: error al listar asignaciones por deportista.

## Consultar asignación por ID

**GET** `/api/asignaciones-entrenamientos/:id`

Devuelve una asignación con sus relaciones.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": {
    "id": "uuid-de-la-asignacion",
    "entrenador": {},
    "deportista": {},
    "entrenamiento": {},
    "estado": "pendiente"
  }
}
```

### Posibles errores

- `404`: asignación no encontrada.
- `500`: error al obtener la asignación.

## Cambiar estado de una asignación

**PATCH** `/api/asignaciones-entrenamientos/:id/estado`

Actualiza el estado de una asignación.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Body

```json
{
  "estado": "completado"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "data": {
    "id": "uuid-de-la-asignacion",
    "estado": "completado",
    "entrenador": {},
    "deportista": {},
    "entrenamiento": {}
  }
}
```

### Posibles errores

- `400`: estado ausente o inválido.
- `404`: asignación no encontrada.
- `500`: error al actualizar el estado.

## Eliminar asignación

**DELETE** `/api/asignaciones-entrenamientos/:id`

Elimina una asignación.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Respuesta exitosa

`204 No Content`

No devuelve body.

### Posibles errores

- `404`: asignación no encontrada.
- `500`: error al eliminar la asignación.

---

# Localidades

Ruta base: `/api/localidades`

## Listar localidades

**GET** `/api/localidades`

Devuelve todas las localidades ordenadas por código postal.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": [
    {
      "codPostal": "2000",
      "nombre": "Rosario",
      "provincia": "Santa Fe"
    }
  ]
}
```

## Consultar localidad

**GET** `/api/localidades/:codPostal`

Devuelve una localidad por código postal.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "data": {
    "codPostal": "2000",
    "nombre": "Rosario",
    "provincia": "Santa Fe"
  }
}
```

### Posibles errores

- `404`: `Localidad no encontrada`.

## Crear localidad

**POST** `/api/localidades`

Crea una localidad.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Body

```json
{
  "codPostal": "2000",
  "nombre": "Rosario",
  "provincia": "Santa Fe"
}
```

### Respuesta exitosa

`201 Created`

```json
{
  "message": "Localidad creada",
  "data": {}
}
```

### Posibles errores

- `500`: error de persistencia.

## Actualizar localidad

**PUT** `/api/localidades/:codPostal`

Actualiza una localidad.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Body

```json
{
  "nombre": "Rosario Centro",
  "provincia": "Santa Fe"
}
```

### Respuesta exitosa

`200 OK`

```json
{
  "message": "Localidad actualizada",
  "data": {}
}
```

### Posibles errores

- `404`: localidad no encontrada.

## Actualizar localidad parcialmente

**PATCH** `/api/localidades/:codPostal`

Realiza la misma actualización utilizando PATCH.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Body, respuesta y errores

Utiliza el mismo formato de `PUT /api/localidades/:codPostal`.

## Eliminar localidad

**DELETE** `/api/localidades/:codPostal`

Elimina una localidad.

### Autenticación

Requiere Bearer JWT de un entrenador.

### Respuesta exitosa

`200 OK`

```json
{
  "message": "Localidad eliminada"
}
```

### Posibles errores

- `404`: localidad no encontrada.

---

# IA / Gemini

Ruta base: `/api/ia`

## Consultar al asistente deportivo

**POST** `/api/ia/chat`

Envía una consulta al asistente deportivo y devuelve una recomendación generada mediante Google Gemini.

### Autenticación

Requiere Bearer JWT de un deportista o entrenador.

### Body

```json
{
  "mensaje": "Quiero una rutina de fuerza de 30 minutos",
  "historial": [
    {
      "rol": "usuario",
      "texto": "Entreno tres veces por semana"
    },
    {
      "rol": "asistente",
      "texto": "Podés comenzar con una rutina de cuerpo completo"
    }
  ]
}
```

`historial` es opcional. Se utilizan como máximo los últimos ocho mensajes y cada texto se limita a 1200 caracteres.

### Respuesta exitosa

`200 OK`

```json
{
  "ok": true,
  "respuesta": "Podés comenzar con un calentamiento..."
}
```

### Posibles errores

- `400`: el mensaje está vacío o no es texto.
- `400`: la consulta supera los 1200 caracteres.
- `502`: Gemini no responde, devuelve un error o no genera una respuesta.
- `503`: `GEMINI_API_KEY` no está configurada.

---

# Endpoints auxiliares

## Comprobar disponibilidad del servidor

**GET** `/test`

Devuelve un texto simple para comprobar que Express está funcionando.

### Autenticación

No requiere autenticación.

### Respuesta exitosa

`200 OK`

```text
Funciona el servidor!
```

## Ruta inexistente

Cualquier ruta no registrada devuelve:

`404 Not Found`

```json
{
  "message": "Resource not found"
}
```

---

## Rutas no activas actualmente

Existe un archivo `backend/routes/asignaciones.routes.js` con endpoints para vincular deportistas y entrenadores:

- `PUT /api/asignaciones/deportistas/:dni/entrenador`
- `GET /api/asignaciones/entrenadores/:dni/deportistas`

Estas rutas **no están montadas en `backend/server.js`**, por lo que no forman parte de la API disponible actualmente y no deben utilizarse hasta registrarlas en Express.
