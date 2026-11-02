function validarReemplazoReserva(req, res, next) {
  const datos = req.body;
  const permitidos = [
    "estudiante",
    "email",
    "sala",
    "fecha",
    "turno",
    "personas",
    "estado",
  ];
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return res.status(400).json({
      error: "Enviá un objeto JSON válido.",
    });
  }
  for (const campo of permitidos) {
    if (!Object.hasOwn(datos, campo)) {
      return res.status(400).json({
        error: "Falta el campo obligatorio: " + campo,
      });
    }
  }
  for (const campo of Object.keys(datos)) {
    if (!permitidos.includes(campo)) {
      return res
        .status(400)
        .json({ error: "El campo " + campo + " no se puede modificar." });
    }
  }
  if (datos.estado !== "pendiente" && datos.estado !== "confirmada") {
    return res.status(400).json({
      error: "El estado debe ser pendiente o confirmada.",
    });
  }
  let personas = datos.personas;

  if (
    typeof personas !== "number" &&
    (typeof personas !== "string" || personas.trim() === "")
  ) {
    return res.status(400).json({
      error: "Personas debe ser un número o un texto numérico no vacío.",
    });
  }

  personas = Number(personas);

  if (
    !Number.isFinite(personas) ||
    !Number.isInteger(personas) ||
    personas < 1 ||
    personas > 6
  ) {
    return res.status(400).json({
      error: "Personas debe ser un número entero entre 1 y 6.",
    });
  }
  if (!["Sala Norte", "Sala Sur", "Sala Multimedia"].includes(datos.sala)) {
    return res.status(400).json({
      error: "La sala seleccionada no es válida.",
    });
  }

  if (!["Mañana", "Tarde", "Noche"].includes(datos.turno)) {
    return res.status(400).json({
      error: "El turno seleccionado no es válido.",
    });
  }
  if (typeof datos.estudiante !== "string" || datos.estudiante.trim() === "") {
    return res.status(400).json({
      error: "El estudiante es obligatorio.",
    });
  }

  if (
    typeof datos.email !== "string" ||
    datos.email.trim() === "" ||
    !datos.email.trim().includes("@")
  ) {
    return res.status(400).json({
      error: "Ingresá un email válido que contenga @.",
    });
  }

  if (typeof datos.fecha !== "string" || datos.fecha.trim() === "") {
    return res.status(400).json({
      error: "La fecha es obligatoria.",
    });
  }
  req.cambiosValidos = {
    estudiante: datos.estudiante.trim(),
    email: datos.email.trim(),
    sala: datos.sala,
    fecha: datos.fecha.trim(),
    turno: datos.turno,
    personas: personas,
    estado: datos.estado,
  };
  next();
}

function validarActualizacionReserva(req, res, next) {
  const datos = req.body;
  const permitidos = ["personas", "estado"];

  // Verificar que el cuerpo sea un objeto válido.
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    return res.status(400).json({
      error: "Enviá un objeto JSON válido.",
    });
  }

  // PATCH debe recibir al menos un campo.
  const camposRecibidos = Object.keys(datos);

  if (camposRecibidos.length === 0) {
    return res.status(400).json({
      error: "Debés enviar al menos un campo para modificar.",
    });
  }

  // No permitir campos distintos de personas y estado.
  for (const campo of camposRecibidos) {
    if (!permitidos.includes(campo)) {
      return res.status(400).json({
        error: "El campo " + campo + " no se puede modificar.",
      });
    }
  }

  // Validar personas únicamente si fue enviado.
  let personas;

  if (Object.hasOwn(datos, "personas")) {
    personas = datos.personas;

    if (
      typeof personas !== "number" &&
      (typeof personas !== "string" || personas.trim() === "")
    ) {
      return res.status(400).json({
        error: "Personas debe ser un número o un texto numérico no vacío.",
      });
    }

    personas = Number(personas);

    if (
      !Number.isFinite(personas) ||
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 6
    ) {
      return res.status(400).json({
        error: "Personas debe ser un número entero entre 1 y 6.",
      });
    }
  }

  // Validar estado únicamente si fue enviado.
  if (
    Object.hasOwn(datos, "estado") &&
    datos.estado !== "pendiente" &&
    datos.estado !== "confirmada"
  ) {
    return res.status(400).json({
      error: "El estado debe ser pendiente o confirmada.",
    });
  }

  // Guardar solamente los campos validados.
  req.cambiosValidos = {};

  if (Object.hasOwn(datos, "personas")) {
    req.cambiosValidos.personas = personas;
  }

  if (Object.hasOwn(datos, "estado")) {
    req.cambiosValidos.estado = datos.estado;
  }

  next();
}

module.exports = { validarReemplazoReserva, validarActualizacionReserva };
