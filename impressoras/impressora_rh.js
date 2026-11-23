const nomeContador = require("./nomeContador");

const impressora_rh = async(browser) =>{

    const page = await browser.newPage();

    await page.goto("http://192.168.250.4/login.html");

    const campoUsuario = page.locator("#i0014");
    const campoSenha = page.locator("#i0016");
    const botaoLogin = page.locator("#submitButton");
    const botaoModoGerente = page.locator("#i0012A");

    await botaoModoGerente.click();
    await campoUsuario.fill("1234567");
    await campoSenha.fill("1234567");
    await botaoLogin.click();

    await page.goto("http://192.168.250.4/d_counter.html");

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("RH"),
        format: "A4",
        printBackground: true
    });

}

module.exports = impressora_rh;