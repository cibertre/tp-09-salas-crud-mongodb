const mongoose = require("mongoose");
const { Reserva } = require("../modelos/reservas");

function representarReserva(reserva) {
  return {
    id: reserva._id ? reserva._id.toString() : reserva.id?.toString(),
    estudiante: reserva.estudiante,
    email: reserva.email,
    sala: reserva.sala,
    fecha: reserva.fecha,
    turno: reserva.turno,
    personas: reserva.personas,
    estado: reserva.estado,
  };
}

function crearServicioReservasMongo() {
  // Ahora aceptamos un filtro (por ejemplo, { sala: "Sala Norte" } o vacío {})
  async function listar(filtroConsulta = {}) {
    const filtro = {};

    // Si pasas una sala para filtrar de forma opcional
    if (filtroConsulta.sala) {
      filtro.sala = filtroConsulta.sala;
    }

    const documentos = await Reserva.find(filtro).lean();
    return documentos.map(representarReserva);
  }
  function validarId(id) {
    if (!mongoose.isObjectIdOrHexString(id)) {
      const error = new Error("Identificador inválido");
      error.codigo = "ID_INVALIDO";
      throw error;
    }
  }
  async function obtenerPorId(id) {
    validarId(id);

    const documento = await Reserva.findById(id).lean();
    return documento ? representarReserva(documento) : null;
  }

  async function crear(datos) {
    const documento = await Reserva.create({
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    });
    return representarReserva(documento);
  }
  async function reemplazar(id, datos) {
    validarId(id);
    const reemplazo = {
      estudiante: datos.estudiante,
      email: datos.email,
      sala: datos.sala,
      fecha: datos.fecha,
      turno: datos.turno,
      personas: datos.personas,
      estado: datos.estado,
    };

    const documento = await Reserva.findOneAndReplace({ _id: id }, reemplazo, {
      new: true,
      runValidators: true,
      upsert: false,
    });
    return documento ? representarReserva(documento) : null;
  }
  async function actualizar(id, cambios) {
    validarId(id);
    const documento = await Reserva.findByIdAndUpdate(
      id,
      { $set: cambios },
      {
        new: true,
        runValidators: true,
        upsert: false,
      },
    );

    return documento ? representarReserva(documento) : null;
  }
  async function eliminar(id) {
    validarId(id);
    const documento = await Reserva.findByIdAndDelete(id);

    return documento ? representarReserva(documento) : null;
  }
  return {
    listar,
    obtenerPorId,
    crear,
    reemplazar,
    actualizar,
    eliminar,
  };
}

module.exports = { crearServicioReservasMongo };
