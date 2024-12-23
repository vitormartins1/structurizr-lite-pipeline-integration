FROM ghcr.io/puppeteer/puppeteer:22.15.0

RUN ls -la /github

# Define o diretório de trabalho como o workspace do GitHub Actions
WORKDIR /github/workspace

# Cria os diretórios necessários e ajusta permissões
RUN mkdir -p /github/home/.local /github/workspace/cache && \
    chown -R pptruser:pptruser /github/home /github/workspace /github/home/.local

RUN ls -la /github/home && ls -la /github/home/.local && ls -la /github/workspace

# Copia os arquivos para o workspace
USER pptruser
COPY --chown=pptruser:pptruser . /github/workspace

RUN ls -la /github/workspace

# Instala as dependências no container
RUN npm install
RUN npx puppeteer install

# Define variáveis de ambiente para Puppeteer
ENV PUPPETEER_CACHE_DIR=/github/workspace/cache \
    XDG_CONFIG_HOME=/github/home/.local \
    HOME=/github/home

# Comando padrão para executar o script
CMD ["node", "/github/workspace/export-diagrams.js"]