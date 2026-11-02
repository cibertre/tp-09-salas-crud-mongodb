const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("../src/config/base-datos");
async function main() {
  try {
    await conectarBaseDatos();
    console.log("Conexion con MongoDB establecida");
  } finally {
    await desconectarBaseDatos();
  }
}
main().catch((error) => {
  //console.error("No se pudo completar la conexión con MongoDB:", error.name);
  console.error("No se pudo completar la conexión con MongoDB:");
  console.error(error);
  const codigosDns = [
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEOUT",
    "ESERVFAIL",
    "EAI_AGAIN",
  ];
  if (codigosDns.includes(error.code)) {
    console.error("Codigo DNS/red:", error.code);
  }
  if (error.syscall === "querySrv" || error.syscall === "queryTxt") {
    console.error("Consulta DNS:", error.syscall);
  }
  console.log("Revisar MONGODB_URI, servidor, red y permisos");
  process.exit(1);
});
