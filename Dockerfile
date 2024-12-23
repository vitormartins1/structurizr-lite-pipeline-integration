FROM ghcr.io/puppeteer/puppeteer:22.15.0

# Usa o usuário padrão da imagem Puppeteer
USER pptruser

RUN echo "Variáveis de ambiente no build:" && env

# Instala as dependências
RUN npm install

RUN echo "Estrutura de arquivos :" && ls -la

# Comando padrão para executar o script
CMD ["node", "export-diagrams.js"]