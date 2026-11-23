const nomeContador = require("./nomeContador");

const impressora_prev_barra_recepcao_direita = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.253.63/");

    await page.locator("#ID_Menu_System").click();
    await page.locator("#ID_SubMenu_System_DeviceInfo").click();
    await page.locator("#ID_SpareSubMenu_System_Counter").click();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("prev_barra_recepcao_direita"),
        format: "A4",
        printBackground: true
    });


}

module.exports = impressora_prev_barra_recepcao_direita;