const nomeContador = require("./nomeContador");

const fonte_1_teste_ergometrico = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.254.42/");

    await page.locator("#ID_Menu_System").click();
    await page.locator("#ID_SubMenu_System_DeviceInfo").click();
    await page.locator("#ID_SpareSubMenu_System_Counter").click();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("fonte_1_teste_ergometrico"),
        format: "A4",
        printBackground: true
    });


}

module.exports = fonte_1_teste_ergometrico;