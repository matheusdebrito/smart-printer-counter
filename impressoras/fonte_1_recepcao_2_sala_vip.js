const nomeContador = require("./nomeContador");

const impressora_fonte_1_recepcao_2_sala_vip = async(browser) =>{

    const page = await browser.newPage();


    await page.goto("http://192.168.254.31/index.html");

    await page.locator("#DEVICE").click();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("fonte_1_recepcao_2_sala_vip"),
        format: "A4",
        landscape: true,
        printBackground: true
    });
}

module.exports = impressora_fonte_1_recepcao_2_sala_vip;