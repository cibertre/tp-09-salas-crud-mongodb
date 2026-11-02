# TP 09 - Reservas de salas con CRUD y MongoDB

Esta es una actualización de la app de reservas de salas de estudio que venía haciendo en los TP 06, 07 y 08. En el TP anterior conecté la aplicación con MongoDB Atlas y agregué una API JSON. En esta entrega incorporé las operaciones que faltaban para completar el CRUD: modificar una reserva, actualizar algunos datos y eliminarla.

Las reservas siguen guardándose en MongoDB Atlas, por lo que no se pierden cuando reinicio el servidor. Además, el sitio HTML y la API utilizan el mismo servicio y trabajan sobre los mismos documentos.

Hecho con Node.js, Express 5, EJS y Mongoose. Alumno: Renato G. Trentini.

---

## 1. Inicio del proyecto

- Arranqué desde el proyecto del TP 08, que ya tenía la conexión con MongoDB Atlas y la API JSON funcionando.
- Mantuve la estructura general de carpetas y la separación entre rutas, controladores, servicios y modelos.
- No copié el historial de Git, ni `node_modules`, ni el archivo `.env`.
- Conservé las dependencias del proyecto anterior y agregué las modificaciones necesarias para esta entrega.
- La carpeta del proyecto se llama `tp-09-salas-crud-mongodb`.

## 2. Versiones

| Herramienta | Versión |
| --- | --- |
| Node.js | v22.16.0 |
| Express | ^5.2.1 |
| Mongoose | ^9.11.2 |
| EJS | ^6.0.1 |
| express-ejs-layouts | ^2.5.1 |
| morgan | ^1.12.1 |
| ESLint (dev) | ^10.12.0 |
| @eslint/js (dev) | ^10.0.1 |
| Prettier (dev) | ^3.9.10 |

Las dependencias están declaradas en `package.json`. Las versiones exactas que se instalaron quedan registradas en `package-lock.json`.

Uso **CommonJS** (`require` y `module.exports`).

## 3. Preparar MongoDB Atlas

1. Utilizo un cluster gratuito M0 en MongoDB Atlas.
2. Tengo configurado un usuario de base de datos para conectarme.
3. En Network Access agregué la IP desde la que me conecto.
4. La base de datos se llama `reservas_salas_u9`.
5. La colección se llama `reservas`.
6. La colección se crea automáticamente cuando se guarda el primer documento.

El sitio y la API trabajan sobre esta misma base de datos.

## 4. Variables de entorno y DNS

El archivo `.env` no se entrega ni se sube al repositorio porque contiene los datos de conexión.

Dejé una plantilla `.env.example`:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://USUARIO:CLAVE@HOST_DEL_CLUSTER/reservas_salas_u9?retryWrites=true&w=majority
```

- `USUARIO`, `CLAVE` y `HOST_DEL_CLUSTER` son marcadores y se deben reemplazar por los datos de cada conexión.
- Para preparar el entorno se copia `.env.example` y se completa con la URI correspondiente.
- La corrección de DNS está en `src/config/base-datos.js`, donde se utilizan los servidores `8.8.8.8` y `1.1.1.1`, como en el TP anterior.
- Esta configuración se ejecuta al cargar el archivo de conexión y permite resolver la dirección `mongodb+srv` de Atlas.

## 5. Cómo iniciar la aplicación

Primero hay que instalar las dependencias:

```bash
npm install
```

Para iniciar el servidor utilizo:

```bash
npm run start:local
```

Este comando ejecuta:

```bash
node --env-file=.env src/index.js
```

Es importante usar `start:local` porque carga las variables del archivo `.env`. En cambio, `npm start` ejecuta `node src/index.js` sin esa opción.

Después se abre:

```text
http://localhost:3000
```

El arranque se realiza en este orden:

1. Lee la configuración del entorno.
2. Intenta conectarse con MongoDB Atlas.
3. Espera a que la conexión se establezca.
4. Recién después inicia el servidor y abre el puerto.

Si falta la URI o falla la conexión, muestra el error y no inicia el servidor.

Cuando se cierra la aplicación con Ctrl+C (`SIGINT`) o mediante `SIGTERM`, se cierra el servidor y después la conexión con MongoDB.

## 6. Cómo está organizado el proyecto

```text
src/
  config/          configuración del entorno y conexión a MongoDB
  modelos/         esquema de Mongoose
  servicios/       operaciones con MongoDB
  controladores/   reciben las solicitudes y preparan las respuestas
  rutas/           rutas HTML y rutas de la API
  middlewares/     validaciones y manejo de solicitudes
  app.js           configuración de Express
  index.js         conexión y arranque del servidor

scripts/            programas para probar desde la terminal
views/              vistas EJS
public/             archivos públicos, como CSS
```

La idea es mantener separadas las responsabilidades:

- El modelo define cómo es una reserva y sus validaciones.
- El servicio se comunica con MongoDB y realiza las operaciones de consulta, creación, modificación y eliminación.
- Los controladores reciben las solicitudes y devuelven la respuesta correspondiente.
- Las rutas conectan las direcciones con sus controladores.
- Los middlewares validan los datos antes de que lleguen al servicio.

Tanto las rutas HTML como las rutas de la API utilizan el mismo servicio de reservas.

### Comandos disponibles

| Comando | Qué hace |
| --- | --- |
| `npm run start:local` | Inicia la aplicación cargando el `.env` |
| `npm run comprobardb` | Comprueba la conexión con MongoDB |
| `npm run validar` | Ejecuta el script de validación de una reserva |
| `npm run crear` | Ejecuta el script para crear una reserva |
| `npm run listar` | Ejecuta el script para listar reservas |
| `npm run format` | Aplica Prettier sobre `src` y `scripts` |
| `npm run format:check` | Comprueba el formato |
| `npm run lint` | Ejecuta ESLint |
| `npm run check` | Ejecuta la comprobación de formato y ESLint |

## 7. Modelo de reserva

Los campos de una reserva son:

| Campo | Regla |
| --- | --- |
| estudiante | Texto obligatorio, con espacios exteriores eliminados |
| email | Texto obligatorio, debe contener `@` |
| sala | `Sala Norte`, `Sala Sur` o `Sala Multimedia` |
| fecha | Texto obligatorio |
| turno | `Mañana`, `Tarde` o `Noche` |
| personas | Número entero entre 1 y 6 |
| estado | `pendiente` o `confirmada` |

El estado tiene un valor predeterminado: `pendiente`.

### Diferencia entre crear y modificar

Para crear una reserva mediante POST, el cliente solamente puede enviar los seis campos originales:

- estudiante
- email
- sala
- fecha
- turno
- personas

No puede enviar `estado` ni `_id`. Si intenta agregar alguno de esos campos, la solicitud se rechaza con código 400.

El estado se asigna automáticamente como `pendiente` desde el modelo.

En cambio, para reemplazar una reserva mediante PUT se deben enviar los siete campos, incluido `estado`.

Para PATCH solamente se permiten los campos `personas` y `estado`. Se puede enviar uno o los dos, pero no se aceptan otros campos.

El servicio no pasa directamente `req.body` a Mongoose. Utiliza los campos que fueron validados y preparados por los middlewares.

También se rechazan datos ausentes, campos no permitidos y valores incorrectos para `personas`, como booleanos, arreglos u objetos.

Además de las validaciones del middleware, el modelo de Mongoose también tiene sus propias validaciones.

Ejemplo de una reserva (datos ficticios):

```json
{
  "id": "65f0c0ffee0123456789abcd",
  "estudiante": "Ana Ejemplo",
  "email": "ana@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 2,
  "estado": "pendiente"
}
```

El `id` es un texto que sale del `_id` de MongoDB. No se convierte a número.

## 8. Endpoints

### API JSON

| Método y dirección | Resultado |
| --- | --- |
| `GET /api/reservas` | Lista todas las reservas |
| `GET /api/reservas?sala=Sala%20Norte` | Lista las reservas de esa sala |
| `GET /api/reservas/:id` | Busca una reserva por su ID |
| `POST /api/reservas` | Crea una reserva |
| `PUT /api/reservas/:id` | Reemplaza todos los campos permitidos de una reserva |
| `PATCH /api/reservas/:id` | Modifica `personas`, `estado` o ambos |
| `DELETE /api/reservas/:id` | Elimina físicamente una reserva |

### Respuestas de la API

| Situación | Código HTTP |
| --- | --- |
| Consulta o modificación correcta | 200 |
| Reserva creada correctamente | 201 |
| Eliminación correcta | 204 |
| ID mal formado | 400 |
| Datos inválidos o campos no permitidos | 400 |
| ID válido pero reserva inexistente | 404 |
| Ruta de API inexistente | 404 |
| Error inesperado del servidor | 500 |

Algunos detalles de cada operación:

**POST**

- Crea una reserva nueva.
- Recibe los seis campos originales.
- El estado queda como `pendiente`.
- Devuelve `201 Created`, la reserva creada y la cabecera `Location`.

**PUT**

- Reemplaza la información de una reserva existente.
- Exige que se envíen todos los campos permitidos, incluidos `personas` y `estado`.
- Si falta algún campo obligatorio, devuelve 400.
- Si el ID es válido pero no existe, devuelve 404.
- Conserva el mismo ID de la reserva.
- No crea una reserva nueva si no encuentra el documento.

**PATCH**

- Permite modificar solamente `personas` y `estado`.
- No exige enviar todos los campos de la reserva.
- Requiere que se envíe al menos uno de los dos campos permitidos.
- Si se intenta modificar otro campo, devuelve 400.
- Si el ID es válido pero no existe, devuelve 404.

**DELETE**

- Elimina físicamente la reserva de MongoDB.
- Si la encuentra, devuelve `204 No Content`, sin contenido en el cuerpo de la respuesta.
- Si se intenta eliminar nuevamente el mismo ID, devuelve 404 porque la reserva ya no existe.

La eliminación no consiste en cambiar el estado a otro valor. El documento se borra de la colección.

### Sitio HTML

| Dirección | Qué hace |
| --- | --- |
| `GET /` | Página de inicio |
| `GET /reservas` | Muestra el listado de reservas |
| `GET /reservas/nueva` | Muestra el formulario |
| `POST /reservas` | Guarda una reserva desde el formulario |
| `GET /reservas/:id` | Muestra el detalle de una reserva |
| `GET /estado` | Devuelve información de las reservas guardadas |

El sitio sigue utilizando MongoDB. Por eso, los cambios que se hacen desde la API también se reflejan cuando se consulta el listado o el detalle desde el navegador.

## 9. Cómo probar en Postman

Para realizar las pruebas hay que tener el servidor iniciado con:

```bash
npm run start:local
```

La dirección base es:

```text
http://localhost:3000
```

En las solicitudes que llevan datos se utiliza `Body > raw > JSON`.

### Ejemplo de POST

**Método:** POST

**URL:**

```text
http://localhost:3000/api/reservas
```

**Body:**

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-11-05",
  "turno": "Mañana",
  "personas": 2
}
```

La respuesta esperada es `201 Created`, con el ID generado por MongoDB y el estado `pendiente`.

### Ejemplo de PUT

**Método:** PUT

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

**Body:**

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Sur",
  "fecha": "2026-11-11",
  "turno": "Tarde",
  "personas": 3,
  "estado": "pendiente"
}
```

La respuesta esperada es `200 OK`, con la reserva actualizada y el mismo ID.

### Ejemplo de PATCH

**Método:** PATCH

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

**Body:**

```json
{
  "estado": "confirmada"
}
```

En este caso solamente cambia el estado. Los demás campos se conservan.

### Ejemplo de DELETE

**Método:** DELETE

**URL:**

```text
http://localhost:3000/api/reservas/ID_DE_LA_RESERVA
```

Si la reserva existe, la respuesta es `204 No Content`.

Si se repite la misma solicitud, la respuesta es `404`, porque ya fue eliminada.

**Importante:** para las pruebas de creación, modificación y eliminación conviene utilizar reservas de prueba. El POST crea documentos reales y el DELETE los elimina de la base.

## 10. Matriz de resultados de las pruebas

En esta sección anoté los resultados que fui comprobando en Postman, el navegador y la terminal.

| Caso probado | Resultado esperado | Resultado observado |
| --- | --- | --- |
| GET listado de reservas | 200 y arreglo JSON | 200. El listado respondió correctamente |
| GET por ID existente | 200 y reserva | 200 con los datos de la reserva |
| GET con ID mal formado (`12345`) | 400 | 400 JSON |
| GET con ID válido inexistente | 404 | 404 JSON |
| POST con datos válidos | 201 y reserva creada | 201. Se creó correctamente |
| POST sin enviar `estado` | 201 y estado `pendiente` | 201. El estado se asignó automáticamente |
| POST enviando `estado` | 400 | 400. Se rechaza el campo no permitido |
| POST enviando `_id` | 400 | 400. Se rechaza el campo no permitido |
| POST con campos obligatorios faltantes | 400 | 400 |
| POST con `personas: 10` | 400 | 400 |
| POST desde el formulario HTML | 302 y redirección | 302. Redirigió al listado |
| Formulario con `personas: 7` | 400 y conservar los valores | 400. Se mostró el mensaje de validación y se conservaron los datos ingresados |
| PUT con todos los campos válidos | 200 y reserva reemplazada | 200. Se actualizaron los campos enviados y se conservó el mismo ID |
| PUT con datos incompletos | 400 | 400 |
| PUT con ID válido inexistente | 404 | 404. No se creó una reserva nueva |
| PATCH modificando solamente `personas` | 200 | 200. Respondió con la reserva modificada |
| PATCH modificando solamente `estado` | 200 | 200. Cambió el estado a `confirmada` y los demás campos se conservaron |
| PATCH sin enviar campos | 400 | 400 |
| PATCH intentando modificar `estudiante` | 400 | 400. Campo no permitido |
| PATCH con ID válido inexistente | 404 | 404 |
| DELETE de una reserva existente | 204 | 204. Se eliminó correctamente |
| Segundo DELETE del mismo ID | 404 | 404. La reserva ya no existía |
| GET después del DELETE | 404 | 404. Se comprobó que el documento había sido eliminado |
| Ruta de API inexistente | 404 JSON | 404 con `{"error":"Ruta no encontrada."}` |
| `npm run check` | Sin errores de formato ni lint | Prettier y ESLint finalizaron sin errores |

### Prueba de persistencia después de reiniciar

También comprobé que los datos continúan guardados en MongoDB después de cerrar y volver a iniciar el servidor.

1. Creé una reserva de prueba llamada `Reserva Persistencia`.
2. La respuesta devolvió el ID `6ae8723379e8e854ac3129e1`.
3. Cerré el servidor con Ctrl+C.
4. Volví a iniciar la aplicación con `npm run start:local`.
5. Hice un GET utilizando el mismo ID.
6. La API respondió `200` y devolvió los mismos datos.
7. Eliminé esa reserva con DELETE y obtuve `204`.
8. Reinicié nuevamente el servidor.
9. Consulté el mismo ID y la API respondió `404`.

Con esta prueba comprobé tanto la persistencia de los datos como la eliminación definitiva del documento.

### Pruebas de validación adicionales

También probé los siguientes casos:

- PATCH con un campo no permitido: 400.
- PATCH sin ningún campo: 400.
- PUT incompleto: 400.
- POST con estado enviado por el cliente: 400.
- POST con `_id` enviado por el cliente: 400.
- PUT y PATCH con un ID válido que no existe: 404.
- DELETE repetido sobre el mismo ID: 404.

## 11. Cosas que fallaron durante las pruebas y cómo las arreglé

Durante el desarrollo aparecieron algunos problemas que tuve que corregir.

| Qué pasaba | Qué hice |
| --- | --- |
| El middleware de validación rechazaba el campo `estado` también en PUT | Modifiqué los campos permitidos según el método HTTP. Para PUT se permiten los siete campos; para POST solamente los seis originales |
| El POST aceptaba `estado` y `_id` enviados por el cliente | Ajusté la validación para rechazar los campos adicionales y responder 400 |
| El PATCH podía recibir campos que no correspondían | Se limitó la actualización a `personas` y `estado` |
| El PUT podía intentar modificar una reserva inexistente | Se comprobó que no se realice una inserción automática y que responda 404 |
| El PATCH podía intentar modificar una reserva inexistente | Se comprobó que responda 404 y no cree otro documento |
| Había que diferenciar una eliminación correcta de una reserva inexistente | Se verificó que el primer DELETE responda 204 y el segundo 404 |

Una cuestión importante fue la validación de los campos según el método HTTP. No es lo mismo crear una reserva, reemplazarla o modificar solamente algunos datos. Por eso tuve que contemplar esas diferencias en los middlewares.

## 12. Prueba específica del PUT

Para comprobar el reemplazo completo utilicé una reserva que ya existía.

**ID utilizado:**

```text
6ae86eb1a2d7938f08f793c9
```

Envié un PUT con los siete campos:

```json
{
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Sur",
  "fecha": "2026-11-11",
  "turno": "Tarde",
  "personas": 3,
  "estado": "pendiente"
}
```

**Resultado obtenido: 200 OK**

La respuesta fue:

```json
{
  "id": "6ae86eb1a2d7938f08f793c9",
  "estudiante": "María Ejemplo",
  "email": "maria.ejemplo@example.com",
  "sala": "Sala Sur",
  "fecha": "2026-11-11",
  "turno": "Tarde",
  "personas": 3,
  "estado": "pendiente"
}
```

La prueba salió correctamente. El ID se mantuvo igual y los campos enviados quedaron actualizados.

## 13. Prueba de PATCH

También comprobé que PATCH modifica solamente los campos permitidos.

Utilicé la reserva de María Ejemplo y envié:

```json
{
  "estado": "confirmada"
}
```

La API respondió `200 OK`.

Después hice un GET sobre el mismo ID y comprobé que el estado había cambiado a `confirmada`, mientras que el estudiante, email, sala, fecha, turno y personas seguían con sus valores anteriores.

Esto permite comprobar que PATCH no reemplaza toda la reserva, sino que modifica solamente los campos enviados.

## 14. Prueba de eliminación

Para comprobar DELETE utilicé una reserva existente.

- Primer DELETE: `204 No Content`.
- Segundo DELETE con el mismo ID: `404 Not Found`.
- GET posterior con el mismo ID: `404 Not Found`.

De esta manera comprobé que la reserva se elimina de la colección y que no se trata solamente de cambiar su estado.

## 15. Lo que todavía no valida mi aplicación

La aplicación tiene las validaciones solicitadas para esta entrega, pero todavía hay cuestiones que no contempla:

- No comprueba que el email sea una dirección real. Solamente verifica que tenga `@`.
- La fecha se guarda como texto obligatorio, pero no se comprueba si es una fecha real o futura.
- No verifica si dos reservas se superponen en el mismo horario.
- No controla disponibilidad real de las salas.
- No tiene autenticación ni permisos de usuarios.
- No comprueba si una reserva ya existe con los mismos datos.

Estas cuestiones podrían agregarse en futuras versiones, pero no forman parte de lo que implementé en este trabajo.

## 16. Comparación con el TP 08

| | TP 08 | TP 09 |
| --- | --- | --- |
| Base de datos | MongoDB Atlas | MongoDB Atlas, misma estructura de conexión |
| Colección | `reservas` | `reservas` |
| Operaciones API | GET y POST | GET, POST, PUT, PATCH y DELETE |
| Crear reserva | Sí | Sí |
| Consultar por ID | Sí | Sí |
| Reemplazar una reserva | No | Sí, con PUT |
| Modificar algunos campos | No | Sí, con PATCH |
| Eliminar una reserva | No | Sí, con DELETE |
| Validación de datos | Validación de creación | Validación diferenciada según el método HTTP |
| Persistencia | Los datos permanecen al reiniciar | Se mantiene y además se comprobó la eliminación definitiva |

## 17. Calidad del código

Para revisar el formato y los errores de código ejecuté:

```bash
npm run check
```

El comando ejecuta:

```bash
npm run format:check
npm run lint
```

El resultado fue correcto:

- Prettier informó que los archivos cumplen con el formato.
- ESLint terminó sin mostrar errores.

También se comprobó la conexión con MongoDB y el funcionamiento de las operaciones principales desde Postman.

