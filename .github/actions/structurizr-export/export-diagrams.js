const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PNG_FORMAT = 'png';
const SVG_FORMAT = 'svg';

const IGNORE_HTTPS_ERRORS = true;
const HEADLESS = true;

const IMAGE_VIEW_TYPE = 'Image';

// Constante para o diretório de saída
const outputDir = '/home/runner/work/structurizr-pipeline-integration/structurizr-pipeline-integration/docs/diagrams/';

if (process.argv.length < 4) {
  console.log("Usage: <structurizrUrl> <png|svg> [username] [password]");
  process.exit(1);
}

const url = process.argv[2];
const format = process.argv[3];

if (format !== PNG_FORMAT && format !== SVG_FORMAT) {
  console.log(`The output format must be '${PNG_FORMAT}' or '${SVG_FORMAT}'.`);
  process.exit(1);
}

let username;
let password;

if (process.argv.length > 4) {
  username = process.argv[4];
  password = process.argv[5];
}

(async () => {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: IGNORE_HTTPS_ERRORS, headless: HEADLESS });
  const page = await browser.newPage();

  // Criar o diretório de saída se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (username && password) {
    const parts = url.split('://');
    const signinUrl = parts[0] + '://' + parts[1].substring(0, parts[1].indexOf('/')) + '/dashboard';
    console.log(` - Signing in via ${signinUrl}`);

    await page.goto(signinUrl, { waitUntil: 'networkidle2' });
    await page.type('#username', username);
    await page.type('#password', password);
    await page.keyboard.press('Enter');
    await page.waitForSelector('div#dashboard');
  }

  console.log(` - Opening ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('structurizr.scripting && structurizr.scripting.isDiagramRendered() === true');

  const views = await page.evaluate(() => structurizr.scripting.getViews());
  console.log(" - Starting export");

  for (const view of views) {
    const diagramFilename = `${view.key}.${format}`;
    const diagramKeyFilename = `${view.key}-key.${format}`;

    await page.evaluate(view => structurizr.scripting.changeView(view.key), view);
    await page.waitForFunction('structurizr.scripting.isDiagramRendered() === true');

    if (format === SVG_FORMAT) {
      const svgForDiagram = await page.evaluate(() =>
        structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true })
      );
      fs.writeFileSync(diagramFilename, svgForDiagram, 'utf8');
      console.log(` - Exported: ${diagramFilename}`);

      if (view.type !== IMAGE_VIEW_TYPE) {
        const svgForKey = await page.evaluate(() => structurizr.scripting.exportCurrentDiagramKeyToSVG());
        fs.writeFileSync(diagramKeyFilename, svgForKey, 'utf8');
        console.log(` - Exported: ${diagramKeyFilename}`);
      }
    } else if (format === PNG_FORMAT) {
      await page.evaluate(
        (diagramFilename) => {
          structurizr.scripting.exportCurrentDiagramToPNG(
            { includeMetadata: true, crop: false },
            function (png) {
              window.savePNG(png, diagramFilename);
            }
          );
        },
        diagramFilename
      );

      if (view.type !== IMAGE_VIEW_TYPE) {
        await page.evaluate(
          (diagramKeyFilename) => {
            structurizr.scripting.exportCurrentDiagramKeyToPNG(function (png) {
              window.savePNG(png, diagramKeyFilename);
            });
          },
          diagramKeyFilename
        );
      }

      console.log(` - Exported: ${diagramFilename}`);
      if (view.type !== IMAGE_VIEW_TYPE) {
        console.log(` - Exported: ${diagramKeyFilename}`);
      }
    }
  }

  console.log(" - Export complete");
  await browser.close();
})();