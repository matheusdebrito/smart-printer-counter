const nomeContador = require("./nomeContador");


const impressora_prev_copa_recepcao = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.252.151/");

    await page.locator("#ID_Menu_System").click();
    await page.locator("#ID_SubMenu_System_DeviceInfo").click();
    await page.locator("#ID_SpareSubMenu_System_Counter").click();

    await page.waitForTimeout(5000);

    const frameElement = page.locator("#SPA-contents-body");

    const frame = frameElement.contentFrame();

    const altura = await frame.locator("#SPA-contents-html").evaluate(
        el => el.scrollHeight
    );

    await frame.locator("#SPA-contents-html").evaluate((el, altura) => {
        el.style.height = `${altura}px`;
        el.style.maxHeight = "none";
        el.style.overflow = "visible";
    }, altura);

    await frameElement.evaluate((el, altura) => {
        el.style.height = `${altura}px`;
        el.style.minHeight = `${altura}px`;
        el.style.maxHeight = "none";
    }, altura);


    await page.screenshot({
        path: nomeContador.nomeContadorPNG("Prev_Copa_Recepcao"),
        fullPage: true
    });


}

module.exports = impressora_prev_copa_recepcao;