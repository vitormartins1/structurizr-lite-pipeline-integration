FROM ghcr.io/puppeteer/puppeteer:22.15.0
RUN ls -la /usr/bin/google-chrome-stable
WORKDIR /action

COPY . .

# Permissões para o usuário Puppeteer
USER root
RUN chown -R pptruser:pptruser /action
USER pptruser

# Instala dependências do Node.js
RUN npm install

# Garante que o Puppeteer tenha o Chrome instalado
RUN npx puppeteer browsers install chrome

CMD ["node", "/action/export-diagrams.js"]