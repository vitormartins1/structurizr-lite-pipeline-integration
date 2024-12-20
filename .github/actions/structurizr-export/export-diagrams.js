const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PNG_FORMAT = 'png';
const SVG_FORMAT = 'svg';

const IGNORE_HTTPS_ERRORS = true;
const HEADLESS = true;

const IMAGE_VIEW_TYPE = 'Image';

// Constante para o diretório de saída
// const outputDir = '/home/runner/work/structurizr-pipeline-integration/structurizr-pipeline-integration/docs/diagrams/';

if (process.argv.length < 3) {
  console.log("Usage: <structurizrUrl> <png|svg> <outputDir>");
  process.exit(1);
}

const url = process.argv[2];
const format = process.argv[3];
const outputDir = process.argv[4];

if (format !== PNG_FORMAT && format !== SVG_FORMAT) {
  console.log(`The output format must be '${PNG_FORMAT}' or '${SVG_FORMAT}'.`);
  process.exit(1);
}

(async () => {
  const browser = await puppeteer.launch({ ignoreHTTPSErrors: IGNORE_HTTPS_ERRORS, headless: HEADLESS });
  const page = await browser.newPage();

  // Variáveis para controle de progresso
  let expectedNumberOfExports = 0;
  let actualNumberOfExports = 0;

  // visit the diagrams page
  console.log(" - Opening " + url);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('structurizr.scripting && structurizr.scripting.isDiagramRendered() === true');
  
  if (format === PNG_FORMAT) {
    // add a function to the page to save the generated PNG images
    await page.exposeFunction('savePNG', (content, filename) => {
      console.log(" - " + filename);
      content = content.replace(/^data:image\/png;base64,/, "");
      fs.writeFile(filename, content, 'base64', function (err) {
        if (err) throw err;
      });
      
      actualNumberOfExports++;

      if (actualNumberOfExports === expectedNumberOfExports) {
        console.log(" - Finished");
      }
    });
  }

  // get the array of views
  const views = await page.evaluate(() => {
    return structurizr.scripting.getViews();
  });

  views.forEach(function(view) {
    if (view.type === IMAGE_VIEW_TYPE) {
      expectedNumberOfExports++; // diagram only
    } else {
      expectedNumberOfExports++; // diagram
      expectedNumberOfExports++; // key
    }
  });

  console.log(" - Starting export");

  for (var i = 0; i < views.length; i++) {
    const view = views[i];

    await page.evaluate((view) => {
      structurizr.scripting.changeView(view.key);
    }, view);

    await page.waitForFunction('structurizr.scripting.isDiagramRendered() === true');

    if (format === SVG_FORMAT) {
      const diagramFilename = outputDir + view.key + '.svg';
      const diagramKeyFilename = outputDir + view.key + '-key.svg'

      var svgForDiagram = await page.evaluate(() => {
        return structurizr.scripting.exportCurrentDiagramToSVG({ includeMetadata: true });
      });
    
      console.log(" - " + diagramFilename);
      fs.writeFile(diagramFilename, svgForDiagram, function (err) {
        if (err) throw err;
      });
      actualNumberOfExports++;
    
      if (view.type !== IMAGE_VIEW_TYPE) {
        var svgForKey = await page.evaluate(() => {
          return structurizr.scripting.exportCurrentDiagramKeyToSVG();
        });
      
        console.log(" - " + diagramKeyFilename);
        fs.writeFile(diagramKeyFilename, svgForKey, function (err) {
          if (err) throw err;
        });
        actualNumberOfExports++;
      }

      if (actualNumberOfExports === expectedNumberOfExports) {
        console.log(" - Finished");
      }    
    } else {
      const diagramFilename = outputDir + view.key + '.png';
      const diagramKeyFilename = outputDir + view.key + '-key.png'

      page.evaluate((diagramFilename) => {
        structurizr.scripting.exportCurrentDiagramToPNG({ includeMetadata: true, crop: false }, function(png) {
          window.savePNG(png, diagramFilename);
        })
      }, diagramFilename);

      if (view.type !== IMAGE_VIEW_TYPE) {
        page.evaluate((diagramKeyFilename) => {
          structurizr.scripting.exportCurrentDiagramKeyToPNG(function(png) {
            window.savePNG(png, diagramKeyFilename);
          })
        }, diagramKeyFilename);
      }
    }
  }

  console.log(" - Closing browser");
  await new Promise(resolve => setTimeout(resolve, 5000)); 
  await browser.close();
  console.log(" - Browser closed");
})();