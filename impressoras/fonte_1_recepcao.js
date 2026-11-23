const nomeContador = require("./nomeContador");

const impressora_fonte_1_recepcao = async(browser) =>{

    const page = await browser.newPage();


    await page.goto("http://192.168.254.45/");

    const campoUsuario = page.locator("#USERNAME");
    const campoSenha = page.locator("#PASSWORD_T");
    const botaoLogin = page.getByRole("button", { name: "Log In" });

    await campoUsuario.fill("administrator");
    await campoSenha.fill("12345678");
    await botaoLogin.click();
    await page.getByText("Status Monitor/Cancel").click();
    await page.getByRole("link", { name: "Check Counter" }).click();

    await page.waitForTimeout(5000);

    await page.pdf({
        path: nomeContador.nomeContadorPDF("fonte_1_recepcao"),
        format: "A4",
        printBackground: true
    });

}

module.exports = impressora_fonte_1_recepcao;