const nomeContador = require("./nomeContador");

const fonte_2_ultra_eco = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.251.37/");

    await page.locator("#ID_Menu_System").click();
    await page.locator("#ID_SubMenu_System_DeviceInfo").click();
    await page.locator("#ID_SpareSubMenu_System_Counter").click();

    await page.waitForTimeout(7000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("fonte_2_ultra_eco"),
        format: "A4",
        printBackground: true
    });


}

module.exports = fonte_2_ultra_eco;