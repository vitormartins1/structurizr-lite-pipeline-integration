const puppeteer = require('puppeteer');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node export-diagrams.js <url> <png|svg>');
  process.exit(1);
}

const url = process.argv[2];
const format = process.argv[3];

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  console.log(`Acessando Structurizr Lite em: ${url}`);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

  const views = await page.evaluate(() => {
    return structurizr.scripting.getViews();
  });

  console.log(`Encontrados ${views.length} diagramas.`);

  for (const view of views) {
    const filename = `./docs/diagrams/${view.key}.${format}`;
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
  }

  console.log('Exportação concluída.');
  await browser.close();
})();