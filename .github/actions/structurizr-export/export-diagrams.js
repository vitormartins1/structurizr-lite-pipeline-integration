const puppeteer = require('puppeteer');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node export-diagrams.js <url> <png|svg>');
  process.exit(1);
}

const url = process.argv[2];
const format = process.argv[3];
const outputDir = './docs/diagrams/';

(async () => {
  console.log('Iniciando exportação de diagramas...');
  try {
    // Criar diretório se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const browser = await puppeteer.launch({
      headless: "new", // Nova implementação headless
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-popup-blocking" // Permitir popups
      ],
    });
    
    const page = await browser.newPage();

    // Permitir popups para a página
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => {
      window.open = function (url) {
        const popup = document.createElement('a');
        popup.href = url;
        popup.target = '_blank';
        popup.click();
      };
    });

    console.log(`Acessando Structurizr Lite em: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const views = await page.evaluate(() => {
      return structurizr.scripting.getViews();
    });

    console.log(`Encontrados ${views.length} diagramas.`);

    for (const view of views) {
      try {
        const filename = `${outputDir}${view.key}.${format}`;
        console.log(`Exportando: ${filename}`);
        if (format === 'png') {
          const buffer = await page.evaluate((key) => {
            return structurizr.scripting.exportCurrentDiagramToPNG({ includeMetadata: true });
          }, view.key);
          fs.writeFileSync(filename, buffer, 'base64');
        } else if (format === 'svg') {
          const svg = await page.evaluate(() => {
            return structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true });
          });
          fs.writeFileSync(filename, svg);
        }
      } catch (error) {
        console.error(`Erro ao exportar o diagrama ${view.key}:`, error);
      }
    }

    console.log('Exportação concluída.');
    await browser.close();
  } catch (error) {
    console.error('Erro durante a exportação:', error);
    process.exit(1);
  }
})();