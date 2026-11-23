const nomeContador = require("./nomeContador");

const impressora_fonte_2_envelopamento = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.251.35/wcd/system_counter.xml");

    await page.locator("#MC_AllTotalCounter").waitFor();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("Fonte_2_Envelopamento"),
        format: "A4",
        printBackground: true
    });


}

module.exports = impressora_fonte_2_envelopamento;