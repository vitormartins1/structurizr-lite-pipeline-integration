FROM ghcr.io/puppeteer/puppeteer:22.15.0

# Define o diretório de trabalho
WORKDIR /action

# Cria os diretórios necessários com permissões corretas
RUN mkdir -p /action /action/output /action/cache /action/.local && \
    chown -R pptruser:pptruser /action

# Copia os arquivos para o container diretamente com permissões ajustadas
USER pptruser
COPY --chown=pptruser:pptruser . /action

# Instala as dependências
RUN npm install

# Define variáveis de ambiente para redirecionar o cache do Puppeteer
ENV PUPPETEER_CACHE_DIR=/action/cache \
    XDG_CONFIG_HOME=/action/.local \
    HOME=/action/.local

# Comando padrão para executar o script
CMD ["node", "/action/export-diagrams.js"]