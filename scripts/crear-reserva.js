const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");
const { Reserva } = require("../src/modelos/reservas");
async function main() {
  try {
    await conectarBaseDatos();
    const reserva = await Reserva.create({
      estudiante: "Juan Pérez",
      email: "juan.perez@example.com",
      sala: "Sala Norte",
      fecha: new Date().toISOString().split("T")[0],
      turno: "Mañana",
      personas: 6,
    });
    console.log("Reserva guardada. _id:", reserva._id.toString());
  } finally {
    await desconectarBaseDatos();
  }
}
main().catch((error) => {
  console.error("No se pudo crear la reserva:", error.name);
  if (error.errors) {
    console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
  }
  console.error("Revisar datos, configuración y disponibilidad de MongoDB.");
  process.exitCode = 1;
});
