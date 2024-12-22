FROM ghcr.io/puppeteer/puppeteer:22.15.0

WORKDIR /action

COPY . .

USER root
RUN chown -R pptruser:pptruser /action
USER pptruser

RUN npm install
# RUN npx puppeteer install
# RUN npx puppeteer browsers install chrome

CMD ["node", "export-diagrams.js"]
