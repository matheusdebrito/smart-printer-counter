const nomeContador = require("./nomeContador");

const impressora_fonte_2_recepcao = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.251.36/");

    await page.waitForTimeout(2000);

    const frame = page.frames().find(
        frame => frame.url() === "http://192.168.251.36/startwlm/Start_Wlm.htm"
    );

    await frame.locator("#tm2 .P001_menu_main").click();
    await frame.locator("#s81").click();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("fonte_2_recepcao"),
        format: "A4",
        printBackground: true
    });

}

module.exports = impressora_fonte_2_recepcao;