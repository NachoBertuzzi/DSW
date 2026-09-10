# Registro inteligente de entrenamiento deportivo

## Descripcion general

Aplicacion web para deportistas y entrenadores que permite registrar entrenamientos, asignar rutinas, guardar el progreso y consultar la informacion desde distintos dispositivos. Tambien incluye un asistente deportivo con Google Gemini.

## Caracteristicas principales

Gestion de usuarios y seguridad: registro e inicio de sesion para deportistas y entrenadores, autenticacion mediante JWT y permisos diferenciados por rol.

Gestion de entrenamientos: creacion de entrenamientos propios, asignacion de rutinas, ejercicios, series, pesos, repeticiones y estados de seguimiento.

Historial y progreso: consulta de entrenamientos, grafico de progreso por ejercicio y actualizacion del peso del deportista con datos persistidos en MySQL.

Gestion de vinculos: los deportistas pueden elegir o desvincular un entrenador; los entrenadores pueden consultar, asignar y desvincular deportistas.

Asistente deportivo: recomendaciones generales y rutinas completas de entrenamiento mediante Google Gemini.

## Tecnologias y dependencias destacadas

Frontend:

- React 19 y Create React App.
- JavaScript.
- Recharts.
- Cypress y Testing Library.

Backend:

- Node.js y Express 5.
- JavaScript.
- MySQL, mysql2 y Mikro-ORM.
- JWT y Bcrypt.
- Vitest.
- Google Gemini.

## Prerrequisitos

Antes de comenzar, asegurate de tener instalado:

- Node.js 18 o superior.
- npm.
- Git.
- MySQL 8 o una instancia MySQL en la nube, como Aiven.
- Una clave de Google AI Studio para utilizar el asistente.

## Instalacion rapida

El backend y el frontend se encuentran en este repositorio. Se recomienda abrir dos terminales.

Clonar el proyecto:

```bash
git clone https://github.com/NachoBertuzzi/DSW.git
cd DSW
```

Instalar dependencias del backend:

```bash
cd backend
npm install
```

Instalar dependencias del frontend, en otra terminal:

```bash
cd frontend
npm install
```

## Configuracion del entorno

Crear `backend/.env` basandose en `backend/.env.example`:

```env
PORT=3000
FRONTEND_URL=http://localhost:3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=entrenamiento_db
DB_USER=dsw
DB_PASSWORD=tu_contraseña
DB_SSL_MODE=
JWT_SECRET=una-clave-secreta-larga
GEMINI_API_KEY=tu-clave-de-google-ai-studio
GEMINI_MODEL=gemini-3.6-flash
```

Para Aiven, usar los datos de la instancia y `DB_SSL_MODE=REQUIRED`. En Render, cargar estas variables desde **Environment**. Nunca subir `.env` ni contraseñas a GitHub.

Para trabajar localmente, crear `frontend/.env`:

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```

## Uso de la aplicacion

Iniciar el backend desde `backend`:

```bash
npm start
```

La API estara disponible en `http://localhost:3000`.

Iniciar el frontend desde `frontend`, en otra terminal:

```bash
npm start
```

La aplicacion estara disponible en `http://localhost:3001`.

Para usar la aplicacion:

1. Registrarse como deportista o entrenador.
2. Iniciar sesion.
3. Crear o asignar entrenamientos.
4. Registrar ejercicios, series, pesos y repeticiones.
5. Consultar el historial y el progreso.

## Tests y calidad

Backend, desde `backend`:

```bash
npm test
```

Frontend, desde `frontend`:

```bash
npm test
npm run e2e
npm run e2e:run
```

Build de produccion:

```bash
npm run build
```

## Despliegue

Backend en Render:

- Root Directory: `backend`.
- Build Command: `npm install`.
- Start Command: `npm start`.
- Configurar las variables de entorno de MySQL, JWT, CORS y Gemini.

Frontend en Vercel:

- Root Directory: `frontend`.
- Framework: Create React App.
- Build Command: `npm run build`.
- Output Directory: `build`.
- Rama: `main`.

## Problemas frecuentes

Error de CORS: configurar `FRONTEND_URL` en Render con la URL exacta de Vercel y volver a desplegar el backend.

El frontend usa localhost en produccion: revisar que Vercel tenga `frontend` como Root Directory y que este desplegando la rama `main`.

El asistente no esta configurado: cargar `GEMINI_API_KEY` y `GEMINI_MODEL` en Render. La clave no debe estar en el frontend.

Error de base de datos: revisar host, puerto, nombre, usuario, contraseña y `DB_SSL_MODE=REQUIRED` para Aiven.

## Documentacion adicional

- [Documentacion de la API](docs/API.md)
- [Propuesta del proyecto](proposal.md)
- [Repositorio](https://github.com/NachoBertuzzi/DSW)
