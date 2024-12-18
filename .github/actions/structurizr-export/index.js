const core = require('@actions/core');
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    const structurizrUrl = core.getInput('structurizr_url'); // URL do workspace
    const outputPath = core.getInput('output_path'); // Pasta de saída para os PNGs

    console.log(`Iniciando exportação para URL: ${structurizrUrl}`);

    // Lança o navegador headless
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Carrega a página do Structurizr
    await page.goto(structurizrUrl, { waitUntil: 'networkidle2' });

    // Espera o botão de export aparecer e clica
    await page.waitForSelector('[data-action="export"]');
    await page.click('[data-action="export"]');

    // Aguarda que os diagramas sejam renderizados
    await page.waitForTimeout(5000); // Ajuste conforme necessário

    // Salva os diagramas como PNG
    const diagramHandles = await page.$$('.structurizr-diagram');
    for (let i = 0; i < diagramHandles.length; i++) {
      const diagram = diagramHandles[i];
      const filePath = path.join(outputPath, `diagram-${i + 1}.png`);

      console.log(`Exportando: ${filePath}`);
      await diagram.screenshot({ path: filePath });
    }

    await browser.close();
    console.log('Exportação concluída com sucesso.');
  } catch (error) {
    core.setFailed(`Erro ao exportar diagramas: ${error.message}`);
  }
})();