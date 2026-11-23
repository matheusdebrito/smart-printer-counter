const nomeContador = require("./nomeContador");

const impressora_faturamento = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.250.10/index.html");

    await page.locator("#DEVICE").click();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("faturamento"),
        format: "A4",
        landscape: true,
        printBackground: true
    });
}

module.exports = impressora_faturamento;