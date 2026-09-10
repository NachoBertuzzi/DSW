Registro inteligente de entrenamiento deportivo

## Descripcion general

Registro inteligente de entrenamiento deportivo es una aplicacion web para deportistas y entrenadores. Centraliza el registro de entrenamientos, la asignacion de rutinas, el seguimiento del progreso y la comunicacion entre ambos perfiles.

Los deportistas pueden crear entrenamientos propios, realizar entrenamientos asignados, registrar series, pesos y repeticiones, consultar su historial y actualizar sus datos. Los entrenadores pueden administrar sus deportistas, crear y asignar entrenamientos, consultar el progreso y eliminar vinculos. La aplicacion tambien incluye un asistente deportivo basado en Google Gemini.

## Caracteristicas principales

### Gestion de usuarios y seguridad

Registro e inicio de sesion para deportistas y entrenadores mediante usuario o email. Las rutas protegidas utilizan tokens JWT y permisos diferenciados segun el rol. Cada usuario puede actualizar sus datos o eliminar su cuenta con confirmacion de contraseña.

### Gestion de entrenamientos

Los deportistas pueden crear entrenamientos propios con fecha, hora, ejercicios, grupos musculares, series, peso y repeticiones. Los entrenadores pueden crear entrenamientos para sus deportistas y asignarlos con fecha, ejercicios y notas.

### Seguimiento e historial

El sistema guarda los entrenamientos en la base de datos para que puedan consultarse desde distintos dispositivos. Permite revisar el historial, completar asignaciones, actualizar estados y eliminar entrenamientos. El perfil incluye un grafico de progreso por ejercicio y peso utilizado.

### Gestion de deportistas y entrenadores

Los deportistas pueden elegir o desvincular un entrenador. Los entrenadores pueden consultar sus deportistas, asignar rutinas y desvincularlos. Las relaciones se almacenan en MySQL y no dependen del navegador utilizado.

### Notas y comunicacion

Los deportistas pueden enviar notas a su entrenador. Las notas se persisten en la API y pueden consultarse desde otro dispositivo.

### Asistente deportivo

El chat ofrece recomendaciones generales de entrenamiento y alimentacion mediante Google Gemini. Puede generar rutinas completas con calentamiento, ejercicios, series, repeticiones, descansos, vuelta a la calma y alternativas de equipamiento. Sus recomendaciones no reemplazan la consulta de un profesional.

### Interfaz responsive

La interfaz React se adapta a escritorio, tablet y dispositivos moviles. La navegacion cambia segun el rol autenticado y ofrece vistas separadas para inicio, entrenamientos, historial, perfil y entrenador.

## Tecnologias y dependencias destacadas

### Frontend

- React 19.
- Create React App y `react-scripts`.
- JavaScript.
- Recharts para graficos de progreso.
- Cypress para pruebas end-to-end.
- Testing Library para pruebas de componentes.

### Backend

- Node.js.
- Express 5.
- JavaScript.
- Mikro-ORM 6.
- MySQL y `mysql2`.
- JWT para autenticacion.
- Bcrypt para contraseñas de deportistas.
- Google Gemini para el asistente deportivo.
- Vitest para pruebas del backend.

## Prerrequisitos

Antes de comenzar, asegurate de tener instalado:

- Node.js 18 o superior.
- npm.
- Git.
- MySQL 8 o compatible, o acceso a una instancia MySQL como Aiven.
- Un navegador moderno.
- Una clave de Google AI Studio si se desea utilizar el asistente.

## Instalacion rapida

El sistema se encuentra dividido en dos aplicaciones dentro del mismo repositorio. Se recomienda abrir dos terminales.

### 1. Clonar el repositorio

```bash
git clone https://github.com/NachoBertuzzi/DSW.git
cd DSW
```

### 2. Instalar dependencias

En la terminal del backend:

```bash
cd backend
npm install
```

En otra terminal, desde la raiz del proyecto:

```bash
cd frontend
npm install
```

## Configuracion del entorno

### Backend

Crear `backend/.env` a partir de `backend/.env.example`:

```env
PORT=3000
FRONTEND_URL=http://localhost:3001
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=entrenamiento_db
DB_USER=dsw
DB_PASSWORD=tu_contraseña
DB_SSL_MODE=
JWT_SECRET=un-secreto-largo-y-privado
GEMINI_API_KEY=tu-clave-de-google-ai-studio
GEMINI_MODEL=gemini-3.6-flash
```

Para una base Aiven o cualquier MySQL con SSL:

```env
DB_HOST=mysql-host
DB_PORT=21263
DB_NAME=defaultdb
DB_USER=avnadmin
DB_PASSWORD=tu_contraseña
DB_SSL_MODE=REQUIRED
```

En Render, configurar las mismas variables desde **Environment**. No subir `backend/.env` al repositorio ni compartir sus claves.

### Frontend

Para trabajar localmente, crear `frontend/.env`:

```env
PORT=3001
REACT_APP_API_URL=http://localhost:3000/api
```

En produccion, el frontend utiliza la API desplegada en Render:

```env
REACT_APP_API_URL=https://dsw-4ub5.onrender.com/api
```

El archivo `frontend/vercel.json` contiene la configuracion de Vercel y el rewrite necesario para la navegacion de React.

## Uso de la aplicacion

### 1. Iniciar el backend

Desde `backend`:

```bash
npm start
```

La API quedara disponible en `http://localhost:3000`.

### 2. Iniciar el frontend

Desde `frontend`, en otra terminal:

```bash
npm start
```

La aplicacion quedara disponible en `http://localhost:3001`.

### 3. Flujo principal

1. Registrarse como deportista o entrenador.
2. Iniciar sesion con usuario o email.
3. Crear un entrenamiento propio o asignar una rutina.
4. Registrar ejercicios, series, peso y repeticiones.
5. Consultar el historial y el progreso desde cualquier dispositivo.
6. Utilizar el asistente deportivo para pedir recomendaciones o rutinas.

## Tests y calidad

El proyecto incluye pruebas para verificar la estabilidad de sus componentes y servicios.

### Backend

Desde `backend`:

```bash
npm test
```

### Frontend

Para ejecutar las pruebas de React:

```bash
npm test
```

Para ejecutar las pruebas end-to-end de Cypress:

```bash
npm run e2e
```

Para ejecutar Cypress en modo automatico:

```bash
npm run e2e:run
```

Para validar el build de produccion con las mismas condiciones de CI:

```bash
$env:CI='true'; npm run build
```

## Despliegue

### Backend en Render

- **Root Directory:** `backend`.
- **Build Command:** `npm install`.
- **Start Command:** `npm start`.
- Configurar `PORT`, las variables de MySQL, `JWT_SECRET`, `FRONTEND_URL` y las variables de Gemini.

### Frontend en Vercel

- **Root Directory:** `frontend`.
- **Framework Preset:** Create React App.
- **Build Command:** `npm run build`.
- **Output Directory:** `build`.
- Rama de produccion: `main`.

## Problemas frecuentes

### Error de CORS

Verifica que `FRONTEND_URL` en Render contenga la URL exacta de Vercel, por ejemplo:

```env
FRONTEND_URL=https://dsw-rho.vercel.app
```

Luego reinicia o vuelve a desplegar el backend.

### El frontend intenta usar localhost en produccion

Verifica que Vercel tenga como directorio raiz `frontend`, que este desplegando la rama `main` y que el build incluya `https://dsw-4ub5.onrender.com/api`.

### El asistente no esta configurado

Configura `GEMINI_API_KEY` y `GEMINI_MODEL` en las variables de entorno de Render. La clave nunca debe guardarse en el frontend ni subirse a GitHub.

### Error al conectar con MySQL

Revisa `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`. Para Aiven, agrega `DB_SSL_MODE=REQUIRED` y confirma que la base este disponible.

### Los cambios no aparecen en otro dispositivo

Verifica que la operacion haya respondido correctamente desde la pestaña **Network** del navegador y que Render y Vercel hayan terminado sus redeploys. Los datos nuevos se guardan en MySQL; los datos antiguos que solo existian en `localStorage` no pueden sincronizarse automaticamente.

## Documentacion adicional

- [Documentacion de la API](../docs/API.md)
- [Propuesta del proyecto](../proposal.md)
- [Repositorio](https://github.com/NachoBertuzzi/DSW)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
