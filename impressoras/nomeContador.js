const path = require("path");

const agora = new Date();

const mes = String(agora.getMonth() + 1).padStart(2, "0");
const dia = String(agora.getDate()).padStart(2, "0");
const hora = String(agora.getHours()).padStart(2, "0");
const minuto = String(agora.getMinutes()).padStart(2, "0");
const segundo = String(agora.getSeconds()).padStart(2, "0");

const nomeContadorPDF = (nomeImpressora) => {
    
    return path.join(
    __dirname,
    "..",
    "contadores",
    `Mes ${mes}`,
    `Dia ${dia}`,
    `Contador-${nomeImpressora}_${dia}_${mes}_${agora.getFullYear()}_${hora}h${minuto}m${segundo}s.pdf`
);
}

const nomeContadorPNG = (nomeImpressora) => {
    
    return path.join(
    __dirname,
    "..",
    "contadores",
    `Mes ${mes}`,
    `Dia ${dia}`,
    `Contador-${nomeImpressora}_${dia}_${mes}_${agora.getFullYear()}_${hora}h${minuto}m${segundo}s.png`
);
}

module.exports = { nomeContadorPDF, nomeContadorPNG };