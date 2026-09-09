# Propuesta-Trabajo-Practico-DSW

## Grupo

### Integrantes

- **53411 - Bertuzzi, Juan Ignacio**
- **52621 - Diaz, Valentina Maria**
- **52181 - Raimundo, Juan Cruz**

## Repositorios

- Repositorio principal: [DSW](https://github.com/NachoBertuzzi/DSW)
- Backend y frontend: organizados dentro de este repositorio.

---

## Tema

### Descripción

**Registro inteligente de entrenamiento deportivo** es una aplicación web para deportistas y entrenadores. Permite registrar entrenamientos, asignar rutinas, consultar el historial y visualizar el progreso de cada ejercicio.

El deportista puede crear entrenamientos propios, realizar entrenamientos asignados, registrar peso y repeticiones, consultar su historial y actualizar sus datos. El entrenador puede administrar deportistas, crear entrenamientos, asignarlos y consultar el progreso registrado. Además, la aplicación incluye un asistente deportivo que brinda recomendaciones generales mediante Google Gemini.

## Modelo

![Modelo de Datos](./assets/modelo.png)

## Alcance Funcional

### Alcance Mínimo

| Requisito               | Detalle                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| CRUD simple             | CRUD de localidades, deportistas y entrenadores.                                                                          |
| CRUD dependiente        | CRUD de entrenamientos relacionados con un deportista y, opcionalmente, un entrenador.                                    |
| Gestión de asignaciones | Crear asignaciones entre entrenador, deportista y entrenamiento; consultar asignaciones, cambiar su estado y eliminarlas. |
| Listado y detalle       | Listar entrenamientos, consultar un entrenamiento por ID y consultar asignaciones por deportista o entrenador.            |
| Autenticación           | Registro, login y validación de sesión mediante tokens JWT para deportistas y entrenadores.                               |
| CUU/Epic                | Cargar entrenamiento propio.                                                                                              |
| CUU/Epic                | Asignar entrenamiento y registrar progreso.                                                                               |

### Funciones del deportista

| Función                         | Descripción                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Registrarse                     | Crear una cuenta con DNI, datos personales, usuario, email, contraseña, altura y peso.    |
| Iniciar sesión                  | Acceder mediante usuario o email y contraseña.                                            |
| Crear entrenamiento propio      | Indicar fecha, hora, grupo muscular, ejercicios, cantidad de series, peso y repeticiones. |
| Realizar entrenamiento asignado | Consultar ejercicios y notas de una asignación y registrar el progreso realizado.         |
| Consultar historial             | Visualizar entrenamientos anteriores y sus detalles.                                      |
| Consultar progreso              | Seleccionar un ejercicio y visualizar la evolución del peso registrado.                   |
| Actualizar perfil               | Consultar datos personales y actualizar el peso actual.                                   |
| Eliminar cuenta                 | Dar de baja la cuenta solicitando confirmación de contraseña.                             |

### Funciones del entrenador

| Función               | Descripción                                                                 |
| --------------------- | --------------------------------------------------------------------------- |
| Registrarse           | Crear una cuenta con datos personales, contacto y especialidad.             |
| Iniciar sesión        | Acceder mediante usuario o email y contraseña.                              |
| Crear entrenamiento   | Crear un entrenamiento para un deportista seleccionado.                     |
| Asignar entrenamiento | Relacionar entrenador, deportista y entrenamiento, agregando fecha y notas. |
| Consultar deportistas | Visualizar los deportistas asociados y gestionar su vinculación.            |
| Consultar historial   | Revisar los entrenamientos realizados por sus deportistas y ver detalles.   |
| Actualizar perfil     | Consultar la información del entrenador.                                    |
| Eliminar cuenta       | Dar de baja la cuenta solicitando confirmación de contraseña.               |

### Asistente deportivo

| Función                  | Descripción                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Chat de recomendaciones  | Responder consultas generales sobre entrenamiento y alimentación mediante Google Gemini. |
| Historial conversacional | Mantener las últimas consultas del chat para contextualizar las respuestas.              |
| Validación de seguridad  | Informar que las recomendaciones son generales y no reemplazan la consulta profesional.  |

---

## Adicionales para Aprobación

### Requisitos

| Tipo             | Detalle                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| CRUD             | CRUD de localidades, deportistas, entrenadores y entrenamientos.                                      |
| CRUD dependiente | Entrenamientos relacionados con deportistas y entrenadores.                                           |
| CUU/Epic         | Feedback o recomendaciones del asistente deportivo.                                                   |
| CUU/Epic         | Asignación de entrenamiento y seguimiento del estado: pendiente, en progreso, completado o cancelado. |
| CUU/Epic         | Registro de progreso por ejercicio mediante peso y repeticiones.                                      |
| Calidad          | Tests funcionales, test de integración del backend y test end-to-end del frontend.                    |
| Responsive       | Interfaz mobile-first con adaptación para SM, MD y LG.                                                |

## Tecnologías utilizadas

- JavaScript.
- React 19 y Create React App.
- Express 5.
- Mikro-ORM 6.
- MySQL y `mysql2`.
- JWT para autenticación.
- Vitest y Supertest para backend.
- Cypress para pruebas E2E.
- Google Gemini para el asistente deportivo.

## Instalación y ejecución

### Requisitos previos

- Node.js 18 o superior y npm.
- MySQL 8 o compatible.
- Git, si se clona el repositorio.
- Un navegador moderno.
- Una clave de Google Gemini si se desea utilizar el asistente.

El proyecto está dividido en dos aplicaciones:

- `backend`: API REST, autenticación, lógica de negocio y conexión con MySQL.
- `frontend`: interfaz web React.

### 1. Obtener el proyecto

```bash
git clone https://github.com/NachoBertuzzi/DSW.git
cd DSW
```

### 2. Instalar dependencias

Backend:

```bash
cd backend
npm install
```

Frontend, en otra terminal:

```bash
cd DSW/frontend
npm install
```

### 3. Crear la base de datos MySQL

Crear la base de datos:

```sql
CREATE DATABASE entrenamiento_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Crear un usuario con permisos, si todavía no existe:

```sql
CREATE USER 'dsw'@'localhost' IDENTIFIED BY 'dsw123';
GRANT ALL PRIVILEGES ON entrenamiento_db.* TO 'dsw'@'localhost';
FLUSH PRIVILEGES;
```

Si se utilizan otras credenciales, deben coincidir con `backend/.env`.

### 4. Crear `backend/.env`

Crear el archivo `backend/.env` con esta estructura:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=entrenamiento_db
DB_USER=dsw
DB_PASSWORD=dsw123
JWT_SECRET=cambiar-por-un-secreto-largo
GEMINI_API_KEY=colocar-clave-de-Google-Gemini
GEMINI_MODEL=gemini-3.6-flash
```

Variables:

| Variable         | Uso                                                             |
| ---------------- | --------------------------------------------------------------- |
| `DB_HOST`        | Host de MySQL.                                                  |
| `DB_PORT`        | Puerto de MySQL, normalmente `3306`.                            |
| `DB_NAME`        | Nombre de la base de datos.                                     |
| `DB_USER`        | Usuario de MySQL.                                               |
| `DB_PASSWORD`    | Contraseña de MySQL.                                            |
| `JWT_SECRET`     | Secreto para firmar y validar tokens.                           |
| `GEMINI_API_KEY` | Clave para habilitar el chat. Puede dejarse vacía si no se usa. |
| `GEMINI_MODEL`   | Modelo de Gemini utilizado por el asistente.                    |

No subir `backend/.env` al repositorio ni compartir sus claves.

Al iniciar, Mikro-ORM sincroniza el esquema de las entidades con MySQL.

### 5. Crear `frontend/.env`

Crear el archivo `frontend/.env`:

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```

- El frontend se ejecutará en `http://localhost:3001`.
- El frontend enviará sus peticiones a `http://localhost:3000/api`.

Si se cambia el puerto del backend, actualizar `REACT_APP_API_URL`. Si se cambia el puerto del frontend, actualizar también `frontend/cypress.config.js`.

Después de modificar este archivo, reiniciar React.

### 6. Levantar el backend

En una terminal:

```bash
cd DSW/backend
node server.js
```

El backend quedará disponible en:

```text
http://localhost:3000
```

Endpoint de comprobación:

```text
http://localhost:3000/test
```

### 7. Levantar el frontend

En otra terminal:

```bash
cd DSW/frontend
npm start
```

Abrir:

```text
http://localhost:3001
```

El backend debe estar levantado para iniciar sesión, consultar datos y guardar entrenamientos.

## Puertos

| Servicio        | Puerto | URL                          |
| --------------- | -----: | ---------------------------- |
| Backend Express | `3000` | `http://localhost:3000`      |
| API REST        | `3000` | `http://localhost:3000/api`  |
| Frontend React  | `3001` | `http://localhost:3001`      |
| MySQL           | `3306` | Conexión interna del backend |

Si un puerto está ocupado:

1. Cambiar `PORT` en `backend/.env` para el backend.
2. Cambiar `PORT` en `frontend/.env` para el frontend.
3. Actualizar `REACT_APP_API_URL` si cambia el puerto del backend.
4. Actualizar `frontend/cypress.config.js` si cambia el puerto del frontend.
5. Reiniciar ambos procesos.

## Tests

### Tests funcionales e integración del backend

Con MySQL iniciado y `backend/.env` configurado:

```bash
cd DSW
npx vitest --run backend/test
```

Las pruebas crean datos temporales y los eliminan al finalizar.

También se pueden ejecutar desde `backend`:

```bash
cd DSW/backend
npm test
```

La suite de integración verifica el flujo completo de crear entrenador, crear deportista, crear entrenamiento, crear asignación, consultar la asignación, cambiarla a `completado`, eliminarla y limpiar los datos.

### Test end-to-end del frontend

Primero levantar el frontend:

```bash
cd DSW/frontend
npm start
```

En otra terminal ejecutar Cypress:

```bash
cd DSW/frontend
npm run e2e:run
```

Para abrir Cypress en modo interactivo:

```bash
npm run e2e
```

El test E2E de login visita `http://localhost:3001` y verifica que estén visibles `Iniciar Sesión` y `Entrar`.

### Build del frontend

```bash
cd DSW/frontend
npm run build
```

El resultado se genera en `frontend/build`.

## Deploy

La configuración de producción mantiene el desarrollo local: el backend sigue usando `3000` localmente si `PORT` no está definido, y Railway asigna su propio `PORT` automáticamente. El frontend sigue usando `3001` localmente y en Vercel debe apuntar a la URL pública del backend.

### 1. Crear MySQL en Railway

1. Crear un proyecto nuevo en [Railway](https://railway.app/).
2. Agregar el servicio MySQL desde `Add`.
3. Esperar a que Railway cree la base y sus variables.
4. Tomar los valores generados por Railway para completar las variables del servicio backend.

El mapeo conceptual es:

| Variable del backend | Variable MySQL de Railway |
| -------------------- | ------------------------- |
| `DB_HOST`            | `MYSQLHOST`               |
| `DB_PORT`            | `MYSQLPORT`               |
| `DB_NAME`            | `MYSQLDATABASE`           |
| `DB_USER`            | `MYSQLUSER`               |
| `DB_PASSWORD`        | `MYSQLPASSWORD`           |

No es necesario copiar credenciales al repositorio. Se cargan desde la sección `Variables` del servicio backend.

### 2. Deploy del backend en Railway

1. En el mismo proyecto, seleccionar `New` y conectar el repositorio GitHub `NachoBertuzzi/DSW`.
2. Configurar `backend` como **Root Directory**.
3. Railway instalará las dependencias con `npm install` y ejecutará `npm start`.
4. En `Variables`, cargar:

```env
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
JWT_SECRET=generar-un-secreto-largo-y-privado
GEMINI_API_KEY=clave-real-de-Google-Gemini
GEMINI_MODEL=gemini-3.6-flash
FRONTEND_URL=https://tu-proyecto.vercel.app
```

Railway proporciona `PORT`; no se debe fijar manualmente para producción. El backend usa `process.env.PORT || 3000`.

5. Generar un dominio público desde `Settings` o `Networking` del servicio backend.
6. Comprobar el health check:

```text
https://tu-backend.up.railway.app/test
```

Debe responder:

```text
Funciona el servidor!
```

Si se cambia la URL pública del frontend después del primer deploy, actualizar `FRONTEND_URL` y redeployar el backend.

### 3. Deploy del frontend en Vercel

1. Importar el repositorio `NachoBertuzzi/DSW` en [Vercel](https://vercel.com/).
2. Configurar `frontend` como **Root Directory**.
3. Mantener Create React App como framework detectado.
4. Usar estos comandos:

```text
Install Command: npm install
Build Command: npm run build
Output Directory: build
```

5. En las variables de entorno de Vercel cargar:

```env
REACT_APP_API_URL=https://tu-backend.up.railway.app/api
```

6. Ejecutar el deploy.
7. Copiar la URL pública de Vercel y colocarla en `FRONTEND_URL` del backend en Railway.
8. Redeployar el backend para aplicar CORS.

No se debe usar `PORT=3001` en Vercel como requisito de producción; Vercel administra el puerto del hosting. `PORT=3001` queda únicamente para el archivo `frontend/.env` local.

### Variables de producción por plataforma

#### Railway: servicio backend

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
GEMINI_API_KEY
GEMINI_MODEL
FRONTEND_URL
```

`PORT` es asignado automáticamente por Railway.

#### Vercel: proyecto frontend

```text
REACT_APP_API_URL=https://tu-backend.up.railway.app/api
```

Las variables `REACT_APP_*` se incorporan durante el build. Si se modifica `REACT_APP_API_URL`, crear un nuevo deployment.

### Validación post-deploy

1. Abrir `https://tu-backend.up.railway.app/test` y comprobar que responda `Funciona el servidor!`.
2. Abrir la URL pública de Vercel.
3. Probar registro e inicio de sesión.
4. Crear un entrenamiento y comprobar que la petición llegue a Railway.
5. Probar una asignación y el cambio de estado.
6. Revisar los logs de Railway si falla una conexión con MySQL o Gemini.

### Compatibilidad local después del deploy

Los archivos locales mantienen esta configuración:

`backend/.env`:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=entrenamiento_db
DB_USER=dsw
DB_PASSWORD=dsw123
JWT_SECRET=secreto-local
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
FRONTEND_URL=http://localhost:3001
```

`frontend/.env`:

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```

No se deben reemplazar estos archivos locales por las credenciales de producción.

## Problemas frecuentes

### No se puede conectar a MySQL

Verificar que MySQL esté iniciado, que exista `entrenamiento_db` y que las variables `DB_*` de `backend/.env` sean correctas.

### El frontend no conecta con el backend

Verificar que el backend esté levantado en el puerto indicado por `REACT_APP_API_URL`. Reiniciar el frontend después de cambiar `.env`.

### Cypress no puede visitar la página

Verificar que React esté ejecutándose en `http://localhost:3001`. Cypress no inicia React automáticamente con la configuración actual.

### El chat no responde

Configurar una `GEMINI_API_KEY` válida en `backend/.env`. Sin esa variable, el resto del sistema puede funcionar, pero el endpoint del asistente responderá que no está configurado.

### El puerto ya está ocupado

Cerrar el proceso que utiliza el puerto o cambiar la configuración siguiendo la sección [Puertos](#puertos).

## Estructura principal

```text
DSW/
├── backend/
│   ├── controllers/
│   ├── db/
│   ├── entities/
│   ├── middlewares/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── test/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── cypress/
│   ├── public/
│   ├── src/
│   ├── .env
│   └── package.json
├── assets/
│   └── modelo.png
└── README.md
```
