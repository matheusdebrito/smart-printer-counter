const { chromium } = require("playwright");
const impressoraRh = require("./impressoras/impressora_rh");
const impressoraFonte2Envelopamento = require("./impressoras/fonte_2_envelopamento");
const impressoraPrevBarraRecepcaoDireita = require("./impressoras/prev_barra_recepcao_direita");
const impressoraPrevCopaSalaMedicos = require("./impressoras/prev_copa_sala_medicos");
const impressoraPrevCopaRecepcao = require("./impressoras/prev_copa_recepcao");
const impressoraFonte1Laudos = require("./impressoras/fonte_1_laudos");
const impressoraPrevBarraRecepcaoEsquerda = require("./impressoras/prev_barra_recepcao_esquerda");
const impressoraFonte1TesteErgometrico = require("./impressoras/fonte_1_teste_ergometrico");
const impressoraFonte2UltraEco = require("./impressoras/fonte_2_ultra_eco");
const impressoraFonte2Envelopamento2 = require("./impressoras/fonte_2_envelopamento_2");
const impressoraFonte1Recepcao = require("./impressoras/fonte_1_recepcao");
const impressoraFonte2Recepcao = require("./impressoras/fonte_2_recepcao");
const impressoraFonte1Recepcao2SalaVip = require("./impressoras/fonte_1_recepcao_2_sala_vip");
const impressoraFaturamento = require("./impressoras/faturamento");

async function main() {
    const browser = await chromium.launch({
        headless: true
    });

    await Promise.all([
        impressoraRh(browser),
        impressoraFonte2Envelopamento(browser),
        impressoraPrevBarraRecepcaoDireita(browser),
        impressoraPrevCopaSalaMedicos(browser),
        impressoraPrevCopaRecepcao(browser),
        impressoraFonte1Laudos(browser),
        impressoraPrevBarraRecepcaoEsquerda(browser),
        impressoraFonte1TesteErgometrico(browser),
        impressoraFonte2UltraEco(browser),
        impressoraFonte2Envelopamento2(browser),
        impressoraFonte1Recepcao(browser),
        impressoraFonte2Recepcao(browser),
        impressoraFonte1Recepcao2SalaVip(browser),
        impressoraFaturamento(browser)
    ]);

    await browser.close();
}

main();