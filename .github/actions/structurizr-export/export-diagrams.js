const STRUCTURIZR_URL = 'http://localhost:8080/workspace/diagrams';
const puppeteer = require('puppeteer');
const fs = require('fs');

if (process.argv.length < 4) {
  console.error('Usage: node export-diagrams.js <url> <png|svg>');
  process.exit(1);
}

const url = process.argv[2];
const format = process.argv[3];
const outputDir = '/home/runner/work/structurizr-pipeline-integration/structurizr-pipeline-integration/docs/diagrams/';

const http = require('http');

(async () => {
  console.log('Iniciando exportação de diagramas...');
  try {
    // Criar diretório se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    console.log(`Diagramas serão exportados para: ${outputDir}`);

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
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('Aguardando o carregamento do Structurizr...');
    try {
      await page.waitForFunction(() => {
        return window.structurizr && window.structurizr.scripting && typeof window.structurizr.scripting.getViews === 'function';
      }, { timeout: 120000 }); // Timeout aumentado para 2 minutos
      console.log('Structurizr carregado com sucesso.');
    } catch (error) {
      console.error('Timeout ao aguardar o carregamento do Structurizr.');
      const isStructurizrLoaded = await page.evaluate(() => {
        return !!(window.structurizr && window.structurizr.scripting);
      });
      console.log('Structurizr estado atual:', isStructurizrLoaded ? 'Carregado' : 'Não carregado');
      throw error;
    }

    console.log('Structurizr carregado com sucesso.');
    const views = await page.evaluate(() => {
      return structurizr.scripting.getViews();
    });

    console.log(`Encontrados ${views.length} diagramas.`);

    for (const view of views) {
      try {
        const filename = `${outputDir}${view.key}.${format}`;
        console.log(`Exportando diagrama para: ${filename}`);
    
        if (format === 'png') {
          const bufferBase64 = await page.evaluate((key) => {
            structurizr.scripting.changeView(key); // Alterar para o diagrama correto
            return structurizr.scripting.exportCurrentDiagramToPNG({ includeMetadata: true });
          }, view.key);
    
          // Converter Base64 para Buffer
          const decodedBuffer = Buffer.from(bufferBase64, 'base64');
          fs.writeFileSync(filename, decodedBuffer);
          console.log(`Exportado com sucesso: ${filename}`);
        } else if (format === 'svg') {
          const svgContent = await page.evaluate((key) => {
            structurizr.scripting.changeView(key); // Alterar para o diagrama correto
            return structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true });
          }, view.key);
    
          fs.writeFileSync(filename, svgContent, 'utf8');
          console.log(`Exportado com sucesso: ${filename}`);
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