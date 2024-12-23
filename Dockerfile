FROM ghcr.io/puppeteer/puppeteer:22.15.0
RUN ls -la /usr/bin/google-chrome-stable
WORKDIR /action

COPY . .

USER root
RUN mkdir -p /action/output && chown -R pptruser:pptruser /action
USER pptruser

RUN npm install

CMD ["node", "/action/export-diagrams.js"]