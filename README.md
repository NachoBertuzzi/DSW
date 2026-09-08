# Propuesta-Trabajo-Practico-DSW

## Grupo

### Integrantes

- 53411 - Bertuzzi, Juan Ignacio
- 52621 - Diaz, Valentina Maria
- 52181 - Raimundo, Juan Cruz

## Repositorios

---

## Tema

### Descripción

Registro inteligente de entrenamiento deportivo.

Aplicación web para deportistas y entrenadores que permite registrar, asignar y consultar entrenamientos, almacenar un historial de las actividades realizadas y realizar seguimiento del progreso deportivo.

El sistema diferencia dos tipos de usuarios: deportistas y entrenadores.

El deportista puede registrarse, iniciar sesión, seleccionar un entrenador, registrar entrenamientos propios, realizar entrenamientos asignados, cargar series, repeticiones y pesos utilizados, consultar su historial de entrenamientos y visualizar gráficamente su evolución por ejercicio.

El entrenador puede registrarse, iniciar sesión, consultar los deportistas asociados, asignar entrenamientos y visualizar los entrenamientos realizados por sus deportistas, incluso aquellos que fueron registrados de forma independiente y no fueron asignados previamente por el entrenador.

Además, el sistema incorpora autenticación mediante JSON Web Tokens (JWT) y un asistente deportivo integrado con la API de Google Gemini.

La API de Gemini se utiliza para permitir que el deportista realice consultas desde la aplicación relacionadas con entrenamiento, ejercicios, organización de rutinas y dudas generales vinculadas a la actividad física. La consulta se envía desde el frontend al backend y el backend se comunica con la API externa utilizando una API Key almacenada mediante variables de entorno.

## Modelo

![Modelo de Datos](./assets/modelo.png)

## Alcance Funcional

### Alcance Mínimo

| Req               | Detalle                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRUD simple       | 1. CRUD Localidad <br> 2. CRUD Entrenador <br> 3. CRUD Entrenamiento                                                                                                                                                                                                                                                                                                  |
| CRUD dependiente  | 1. CRUD Deportista {depende de} Localidad y puede asociarse a un Entrenador <br> 2. Asignación de Entrenamiento {depende de} Entrenador, Deportista y Entrenamiento                                                                                                                                                                                                   |
| Listado + detalle | 1. Listado e historial de entrenamientos realizados por el deportista, mostrando información de cada entrenamiento y los ejercicios realizados. <br> 2. Listado de entrenamientos asignados al deportista. <br> 3. Listado de deportistas asociados a un entrenador. <br> 4. Consulta de los entrenamientos realizados por los deportistas asociados a un entrenador. |
| CUU/Epic          | 1. Cargar entrenamiento <br> 2. Asignar entrenamiento a un deportista <br> 3. Registrar series, repeticiones y peso utilizado <br> 4. Consultar historial y progreso deportivo                                                                                                                                                                                        |

---

## Adicionales para Aprobación

### Req

| Tipo     | Detalle                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CRUD     | 1. Asociación y baja de entrenador por parte del deportista <br> 2. Baja de cuenta de deportista y entrenador                                                                                                                                                                                                                                                                                                                                         |
| CUU/Epic | 1. Autenticación mediante JSON Web Tokens (JWT) <br> 2. Integración con la API de Google Gemini para un asistente deportivo <br> 3. Visualización gráfica del progreso por ejercicio <br> 4. Historial de entrenamientos realizados <br> 5. Visualización por parte del entrenador de todos los entrenamientos realizados por sus deportistas, incluso aquellos no asignados previamente por él <br> 6. Envío de notas del deportista a su entrenador |

---

## Tecnologías Utilizadas

### Backend

- Node.js
- Express
- MikroORM
- MySQL
- JSON Web Tokens (JWT)

### Frontend

- React
- React Router
- Recharts

### API Externa

- Google Gemini API

La integración con Gemini se utiliza para brindar un asistente deportivo dentro de la aplicación. El deportista puede realizar consultas en lenguaje natural y recibir respuestas generadas por inteligencia artificial relacionadas con entrenamiento y actividad física.

La API Key utilizada para esta integración se almacena en variables de entorno y no se incluye directamente en el código fuente.

---

## Seguridad y Variables de Entorno

El sistema utiliza autenticación mediante JWT.

Luego de un inicio de sesión correcto, el backend genera un token para el usuario. Dicho token se utiliza para validar el acceso a rutas protegidas.

Los datos sensibles se manejan mediante variables de entorno.
