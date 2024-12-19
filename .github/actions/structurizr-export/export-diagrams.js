const puppeteer = require('puppeteer');
const fs = require('fs');

const PNG_FORMAT = 'png';
const SVG_FORMAT = 'svg';
const IMAGE_VIEW_TYPE = 'Image';

const url = process.argv[2];
const format = process.argv[3];
const outputDir = '/home/runner/work/structurizr-pipeline-integration/structurizr-pipeline-integration/docs/diagrams/';

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  const page = await browser.newPage();

  // Criar diretório se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Acessando Structurizr Lite em: ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction('structurizr.scripting && structurizr.scripting.isDiagramRendered() === true', { timeout: 120000 });

  const views = await page.evaluate(() => structurizr.scripting.getViews());

  for (const view of views) {
    const filename = `${outputDir}${view.key}.${format}`;
    console.log(`Exportando diagrama para: ${filename}`);

    if (format === SVG_FORMAT) {
      const svgContent = await page.evaluate((key) => {
        structurizr.scripting.changeView(key);
        return structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true });
      }, view.key);

      fs.writeFileSync(filename, svgContent, 'utf8');
    } else if (format === PNG_FORMAT) {
      const pngContent = await page.evaluate((key) => {
        structurizr.scripting.changeView(key);
        return structurizr.scripting.exportCurrentDiagramToPNG({ includeMetadata: true });
      }, view.key);

      const decodedBuffer = Buffer.from(pngContent.replace(/^data:image\/png;base64,/, ''), 'base64');
      fs.writeFileSync(filename, decodedBuffer);
    }

    console.log(`Exportado com sucesso: ${filename}`);
  }

  console.log('Exportação concluída.');
  await browser.close();
})();