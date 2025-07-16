Trabajo Práctico DSW - Backend

📅 Fecha de entrega: [Completar por el grupo]

🔖 Tecnologías utilizadas

Node.js

Express.js

MySQL (base de datos persistente)

mysql2 (driver de conexión)

Arquitectura en capas (routes, controllers, services, db)

🏗️ Requisitos de Regularidad cumplidos

✅ Desarrollado en JavaScript

✅ Framework web Express.js con middlewares

✅ API RESTful implementada

✅ Base de datos persistente (MySQL)

✅ Acceso mediante servicio externo (db.js)

✅ Arquitectura en capas: Routes, Controllers, Services

✅ Validación de entradas y manejo de errores en todas las rutas

✅ Dependencias registradas en package.json

📊 Estructura del proyecto (carpetas)

/backend
|-- controllers
|-- routes
|-- services
|-- db.js
|-- server.js
|-- package.json

🚀 Instalación y ejecución

Requisitos previos:

Tener Node.js y MySQL instalados

1. Clonar repositorio:

git clone <URL_DEL_REPO>
cd backend

2. Instalar dependencias:

npm install

3. Crear base de datos y correr script de estructura (si aplica):

CREATE DATABASE entrenamiento_db;
-- Ejecutar script con tablas: deportista, entrenador, entrenamiento, localidad

4. Configurar acceso a la base de datos

Editar db.js con tus credenciales de MySQL:

host: '127.0.0.1',
user: 'root',
password: 'tu_contraseña',
database: 'entrenamiento_db'

5. Ejecutar servidor:

node server.js

Servidor corriendo en http://localhost:3000

🔧 Endpoints disponibles

Deportistas

GET /api/deportistas

GET /api/deportistas/:id

POST /api/deportistas

PUT /api/deportistas/:id

DELETE /api/deportistas/:id

Entrenadores

GET /api/entrenadores

GET /api/entrenadores/:id

POST /api/entrenadores

PUT /api/entrenadores/:id

DELETE /api/entrenadores/:id

Entrenamientos

GET /api/entrenamientos

GET /api/entrenamientos/:id

GET /api/entrenamientos/deportista/:id

POST /api/entrenamientos

PUT /api/entrenamientos/:id

DELETE /api/entrenamientos/:id

Localidades

GET /api/localidades

GET /api/localidades/:id

POST /api/localidades

PUT /api/localidades/:id

DELETE /api/localidades/:id

🔢 Validaciones implementadas

Validación de campos obligatorios (por tipo y rango)

Validación de formatos (fechas, hora, strings vacíos, etc.)

Manejo de errores con mensajes claros en formato JSON

📊 CRUDs realizados (ejemplo para grupo de 4 integrantes)

CRUD Simple: Localidad, Deportista, Entrenador

CRUD Dependiente: Entrenamiento (depende de Deportista y Entrenador)

Listado con filtro: GET /api/entrenamientos/deportista/:id + detalle

📑 Documentación adicional requerida

📄 Integrantes

legajo - Apellido, Nombre

legajo - Apellido, Nombre

legajo - Apellido, Nombre

legajo - Apellido, Nombre

🔗 Enlaces

Repositorio Backend: [URL_BACKEND]

Repositorio Frontend: [URL_FRONTEND]

Link a propuesta: [GOOGLE DRIVE / PDF / etc.]

🔐 Notas

Este README cumple con los requisitos de la cátedra para entrega.

En caso de deploy futuro, agregar sección de Credenciales y URL de acceso.

Recordar pactar la defensa grupal con docentes antes del 14/11.
