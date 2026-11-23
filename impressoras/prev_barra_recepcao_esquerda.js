const nomeContador = require("./nomeContador");

const prev_barra_recepcao_esquerda = async(browser) =>{

    // const page = await browser.newPage();

    // await page.goto("http://192.168.253.150/");

    // await page.locator("#ID_Menu_System").click();
    // await page.locator("#ID_SubMenu_System_DeviceInfo").click();
    // await page.locator("#ID_SpareSubMenu_System_Counter").click();

    // await page.waitForTimeout(5000);

    // await page.pdf({
    //     path: nomeContador.nomeContadorPDF("prev_barra_recepcao_esquerda"),
    //     format: "A4",
    //     printBackground: true
    // });

    try{
            const page = await browser.newPage();

        await page.goto("http://192.168.253.150/");

        await page.locator("#ID_Menu_System").click();
        await page.locator("#ID_SubMenu_System_DeviceInfo").click();
        await page.locator("#ID_SpareSubMenu_System_Counter").click();

        await page.waitForTimeout(5000);

        await page.pdf({
            path: nomeContador.nomeContadorPDF("prev_barra_recepcao_esquerda"),
            format: "A4",
            printBackground: true
        });
    } catch(error){
        console.log(`não foi possível acessar a impressora Barra recepção esquerda ${error}`)
    }

}

module.exports = prev_barra_recepcao_esquerda;