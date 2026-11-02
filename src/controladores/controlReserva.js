function crearControladorReservas(servicio, salasPermitidas, turnosPermitidos) {
  async function listar(req, res) {
    const reservas = await servicio.listar();
    res.render("reservas/lista", {
      titulo: "Reservas de salas",
      reservas,
    });
  }
  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      errores: null,
      valores: {},
      salas: salasPermitidas,
      turnos: turnosPermitidos,
    });
  }
  async function mostrarDetalle(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }
    res.render("reservas/detalle", { titulo: reserva.estudiante, reserva });
  }
  async function crear(req, res) {
    try {
      // Usar req.body o req.reservaValidada según cómo devuelva los datos tu middleware
      const datos = req.reservaValidada || req.body;
      const nuevaReserva = await servicio.crear(datos);

      // Si la petición viene de la API (por ejemplo, si la ruta incluye /api/)
      if (req.baseUrl.includes("/api")) {
        return res
          .status(201)
          .location(`${req.baseUrl}/${nuevaReserva.id}`)
          .json(nuevaReserva);
      }

      res.redirect("/reservas");
    } catch (error) {
      console.error("Error al crear reserva:", error);
      if (req.baseUrl.includes("/api")) {
        return res
          .status(500)
          .json({ error: "Error interno al crear la reserva" });
      }
      // Manejo de errores para la vista web...
    }
  }

  async function eliminarApi(req, res) {
    try {
      const eliminado = await servicio.eliminar(req.params.id);

      if (!eliminado) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(204).end();
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al eliminar reserva:", error);

      return res.status(500).json({
        error: "Error interno al eliminar la reserva.",
      });
    }
  }

  async function obtenerApi(req, res) {
    try {
      const reserva = await servicio.obtenerPorId(req.params.id);

      if (!reserva) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al obtener reserva:", error);

      return res.status(500).json({
        error: "Error interno al obtener la reserva.",
      });
    }
  }

  async function listarApi(req, res) {
    try {
      const sala = req.query.sala;
      if (sala !== undefined && typeof sala !== "string") {
        return res
          .status(400)
          .json({ error: "El filtro sala debe ser un único texto." });
      }
      // Si filtrar por sala opcionalmente:
      const filtro = req.query.sala ? { sala: req.query.sala } : {};
      const reservas = await servicio.listar(filtro); // O simplemente await servicio.listar();
      res.json(reservas);
    } catch (error) {
      console.error("Error al listar reservas en la API:", error);
      res.status(500).json({ error: "Error interno al obtener las reservas." });
    }
  }

  async function reemplazarApi(req, res) {
    try {
      const reserva = await servicio.reemplazar(
        req.params.id,
        req.cambiosValidos,
      );

      if (!reserva) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al reemplazar reserva:", error);

      return res.status(500).json({
        error: "Error interno al reemplazar la reserva.",
      });
    }
  }

  async function actualizarApi(req, res) {
    try {
      const reserva = await servicio.actualizar(
        req.params.id,
        req.cambiosValidos,
      );

      if (!reserva) {
        return res.status(404).json({
          error: "No existe una reserva con ese identificador.",
        });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      if (error.codigo === "ID_INVALIDO") {
        return res.status(400).json({
          error: "El identificador de la reserva no es válido.",
        });
      }

      console.error("Error al actualizar reserva:", error);

      return res.status(500).json({
        error: "Error interno al actualizar la reserva.",
      });
    }
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    listarApi,
    obtenerApi,
    eliminarApi,
    reemplazarApi,
    actualizarApi,
    crearApi: crear,
  };
}
module.exports = { crearControladorReservas };
