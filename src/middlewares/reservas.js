function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reserva de salas";
  next();
}

function validarReserva(salasPermitidas, turnosPermitidos) {
  return function (req, res, next) {
    const valores = req.body ?? {};

    const camposPermitidos =
      req.method === "PUT"
        ? [
            "estudiante",
            "email",
            "sala",
            "fecha",
            "turno",
            "personas",
            "estado",
          ]
        : ["estudiante", "email", "sala", "fecha", "turno", "personas"];

    const camposRecibidos = Object.keys(valores);

    const camposNoPermitidos = camposRecibidos.some(
      (campo) => !camposPermitidos.includes(campo),
    );

    if (camposNoPermitidos) {
      return res.status(400).json({
        error: "La solicitud contiene campos no permitidos.",
      });
    }
    const estudiante =
      typeof valores.estudiante === "string" ? valores.estudiante.trim() : "";
    const email = typeof valores.email === "string" ? valores.email.trim() : "";
    const sala = typeof valores.sala === "string" ? valores.sala.trim() : "";
    const fecha = typeof valores.fecha === "string" ? valores.fecha.trim() : "";
    const turno = typeof valores.turno === "string" ? valores.turno.trim() : "";

    const personasRecibidas = valores.personas;
    const personas =
      typeof personasRecibidas === "number" ||
      (typeof personasRecibidas === "string" && personasRecibidas.trim() !== "")
        ? Number(personasRecibidas)
        : NaN;

    const emailValido = /@/.test(email);
    const personasValidas =
      Number.isInteger(personas) && personas >= 1 && personas <= 6;
    const salaValida = salasPermitidas ? salasPermitidas.includes(sala) : true;
    const turnoValido = turnosPermitidos
      ? turnosPermitidos.includes(turno)
      : true;

    if (
      !estudiante ||
      !emailValido ||
      !salaValida ||
      !fecha ||
      !turnoValido ||
      !personasValidas
    ) {
      const mensajeError =
        "Datos inválidos. Verificá estudiante, email, sala (Norte/Sur/Multimedia), turno (Mañana/Tarde/Noche) y personas (1 a 6).";

      // Si la petición viene de la API o Postman usa /api/
      if (req.baseUrl && req.baseUrl.includes("/api")) {
        return res.status(400).json({ error: mensajeError });
      }

      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva reserva",
        errores: [mensajeError],
        valores,
        salas: salasPermitidas,
        turnos: turnosPermitidos,
      });
    }

    // Guardamos los datos validados para que el controlador los guarde en Mongo
    req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
    next();
  };
}

module.exports = { prepararAreaReservas, validarReserva };
