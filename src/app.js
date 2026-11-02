const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");
const {
  crearIdentificadorSolicitud,
  medirDuracion,
} = require("./middlewares/solicitudes");
const { crearManejadorErrores } = require("./middlewares/errores");
const { crearControladorReservas } = require("./controladores/controlReserva");
const { crearRouterReservas } = require("./rutas/rutasReserva");
const { crearRouterReservasApi } = require("./rutas/reservas-api");
function crearApp({
  servicioReservas,
  formatoRegistro,
  salasPermitidas,
  turnosPermitidos,
}) {
  const app = express();
  const controlador = crearControladorReservas(
    servicioReservas,
    salasPermitidas,
    turnosPermitidos,
  );
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.set("layout", "layouts/main");
  app.use(morgan(formatoRegistro));
  app.use(crearIdentificadorSolicitud());
  app.use(medirDuracion);
  app.use(expressLayouts);
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Salas de Estudio" });
  });
  app.get("/estado", async (req, res) => {
    const reservas = await servicioReservas.listar();
    res.json({
      cantidad: reservas.length,
      id: res.locals.solicitudId,
    });
  });
  app.use(
    "/api/reservas",
    crearRouterReservasApi(controlador, salasPermitidas, turnosPermitidos),
  );
  app.use(
    "/reservas",
    crearRouterReservas(controlador, salasPermitidas, turnosPermitidos),
  );
  app.use((req, res) => {
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ error: "Ruta no encontrada." });
    }
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });
  app.use(
    crearManejadorErrores({
      vistaFormulario: "reservas/nueva",
      tituloFormulario: "Nueva reserva",
    }),
  );
  return app;
}
module.exports = { crearApp };
