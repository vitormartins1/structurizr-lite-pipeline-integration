const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PNG_FORMAT = 'png';
const SVG_FORMAT = 'svg';

const url = process.argv[2]; // Ex.: http://localhost:8080
const format = process.argv[3]; // Ex.: png ou svg
const outputDir = './docs'; // Diretório onde os diagramas serão salvos

if (!url || (format !== PNG_FORMAT && format !== SVG_FORMAT)) {
  console.log("Usage: node export-diagrams.js <structurizrUrl> <png|svg>");
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Acessando Structurizr UI em: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }); // 60 segundos de timeout

  await page.waitForFunction('structurizr.scripting && structurizr.scripting.isDiagramRendered() === true');

  const views = await page.evaluate(() => structurizr.scripting.getViews());
  if (!views.length) {
    console.log("Nenhum diagrama encontrado.");
    await browser.close();
    process.exit(0);
  }

  console.log(`Exportando ${views.length} diagramas...`);
  for (const view of views) {
    console.log(`Processando: ${view.key}`);

    await page.evaluate((view) => {
      structurizr.scripting.changeView(view.key);
    }, view);

    await page.waitForFunction('structurizr.scripting.isDiagramRendered() === true');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Gera algo como "2024-12-18T01-23-45"
    const filePath = path.join(outputDir, `${view.key}-${timestamp}.${format}`);
    if (format === PNG_FORMAT) {
      const content = await page.evaluate(() =>
        structurizr.scripting.exportCurrentDiagramToPNG({ includeMetadata: true, crop: false })
      );
      fs.writeFileSync(filePath, content.replace(/^data:image\/png;base64,/, ""), "base64");
    } else if (format === SVG_FORMAT) {
      const content = await page.evaluate(() =>
        structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true })
      );
      fs.writeFileSync(filePath, content);
    }

    console.log(`Salvo: ${filePath}`);
  }

  await browser.close();
})();