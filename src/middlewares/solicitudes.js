function crearIdentificadorSolicitud() {
  let numero = 0;
  return function identificarSolicitud(req, res, next) {
    numero += 1;
    res.locals.solicitudId = `SOL-${String(numero).padStart(4, "0")}`;
    next();
  };
}
function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();
  res.on("finish", () => {
    const milisegundos = Number(process.hrtime.bigint() - inicio) / 1_000_000;
    console.log(
      `[${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${milisegundos.toFixed(2)} ms`,
    );
  });
  next();
}
module.exports = { crearIdentificadorSolicitud, medirDuracion };
