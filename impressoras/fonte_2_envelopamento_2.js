const nomeContador = require("./nomeContador");

const fonte_2_envelopamento_2 = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.251.39/wcd/system_counter.xml");

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("fonte_2_envelopamento_2"),
        format: "A4",
        printBackground: true
    });


}

module.exports = fonte_2_envelopamento_2;