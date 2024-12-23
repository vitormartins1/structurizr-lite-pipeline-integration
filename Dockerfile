FROM ghcr.io/puppeteer/puppeteer:22.15.0

# Define o diretório de trabalho como o workspace do GitHub Actions
WORKDIR /github/workspace

# Cria os diretórios necessários com permissões apropriadas
RUN mkdir -p /github/home /github/workspace /github/home/.local && \
    chown -R pptruser:pptruser /github/home /github/workspace

# Copia os arquivos para o workspace
USER pptruser
COPY --chown=pptruser:pptruser . /github/workspace

# Instala as dependências no container
RUN npm install

# Define variáveis de ambiente para Puppeteer
ENV PUPPETEER_CACHE_DIR=/github/workspace/cache \
    XDG_CONFIG_HOME=/github/home/.local \
    HOME=/github/home

# Comando padrão para executar o script
CMD ["node", "/github/workspace/export-diagrams.js"]