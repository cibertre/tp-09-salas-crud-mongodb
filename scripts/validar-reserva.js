const { Reserva } = require("../src/modelos/reservas");

async function main() {
  const reserva = new Reserva({
    estudiante: "Juan Pérez",
    email: "juan.perez@example.com",
    sala: "Sala Norte",
    fecha: new Date(),
    turno: "Mañana",
    personas: 3,
  });
  await reserva.validate();
  console.log("Datos Válidos, todavia no guardamos en MongoDB");
}
main().catch((error) => {
  console.error("Validación rechazada:", error.name);
  if (error.errors) {
    console.log("Campos a revisar:", Object.keys(error.errors).join(", "));
  }
  process.exitCode = 1;
});
