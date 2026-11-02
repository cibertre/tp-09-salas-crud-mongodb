const { leerConfiguracion } = require("./config/entorno");
const { crearServicioReservasMongo } = require("./servicios/serviceReserva");
const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("./config/base-datos");
const { crearApp } = require("./app");

/* D A T O S */

const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];

const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

const reservas = [
  {
    id: 1,
    estudiante: "Miguel Merentiel",
    email: "miguel.merentiel@gmail.com",
    sala: "Sala Norte",
    fecha: "2026-09-23",
    turno: "Mañana",
    personas: 3,
  },
  {
    id: 2,
    estudiante: "Lautaro Blanco",
    email: "lautaro_blanco@yahoo.com.ar",
    sala: "Sala Sur",
    fecha: "2026-09-24",
    turno: "Tarde",
    personas: 5,
  },
  {
    id: 3,
    estudiante: "Santiago Ascacibar",
    email: "santiago.ascacibar@hotmail.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-24",
    turno: "Noche",
    personas: 6,
  },
  {
    id: 4,
    estudiante: "Leandro Paredes",
    email: "leandro.paredes@outlook.com",
    sala: "Sala Multimedia",
    fecha: "2026-09-25",
    turno: "Mañana",
    personas: 3,
  },
];

async function main() {
  const { puerto, formatoRegistro } = leerConfiguracion();
  await conectarBaseDatos();
  const servicioReservas = crearServicioReservasMongo();

  const app = crearApp({
    servicioReservas,
    formatoRegistro,
    salasPermitidas,
    turnosPermitidos,
  });

  const servidor = app.listen(puerto, () => {
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });
  let cerrando = false;
  function cerrar() {
    if (cerrando) return;
    cerrando = true;
    servidor.close(async () => {
      try {
        await desconectarBaseDatos();
      } catch (error) {
        console.error("Error al cerrar:", error.name);
        process.exitCode = 1;
      }
    });
  }
  process.once("SIGINT", cerrar);
  process.once("SIGTERM", cerrar);
  servidor.on("error", (error) => {
    console.error("No se pudo escuchar el puerto:", error.code);
    process.exitCode = 1;
    desconectarBaseDatos().catch((fallo) => {
      console.error("Error al cerrar:", fallo.name);
    });
  });
}
main().catch(async (error) => {
  console.error("No se pudo iniciar la aplicación:", error);
  console.error("Revisar entorno, DNS, red, acceso de Atlas y puerto.");
  process.exitCode = 1;
  try {
    await desconectarBaseDatos();
  } catch (fallo) {
    console.error("Error al cerrar:", fallo.name);
  }
});

module.exports = {
  reservas,
  salasPermitidas,
  turnosPermitidos,
};
