const express = require("express");
const { validarReserva } = require("../middlewares/reservas");
const {
  validarReemplazoReserva,
  validarActualizacionReserva,
} = require("../middlewares/cambios-reservas");
function crearRouterReservasApi(
  controlador,
  salasPermitidas,
  turnosPermitidos,
) {
  const router = express.Router();
  router.get("/", controlador.listarApi);
  router.get("/:id", controlador.obtenerApi);
  router.post(
    "/",
    validarReserva(salasPermitidas, turnosPermitidos),
    controlador.crearApi,
  );
  router.delete("/:id", controlador.eliminarApi);
  router.put(
    "/:id",
    validarReserva(salasPermitidas, turnosPermitidos),
    validarReemplazoReserva,
    controlador.reemplazarApi,
  );
  router.patch("/:id", validarActualizacionReserva, controlador.actualizarApi);
  return router;
}
module.exports = { crearRouterReservasApi };
