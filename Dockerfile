FROM ghcr.io/puppeteer/puppeteer:22.15.0

# Usa o usuário root temporariamente para ajustar permissões
USER root

# Usa o usuário padrão da imagem Puppeteer
USER pptruser

# Debug para variáveis de ambiente
RUN echo "Variáveis de ambiente no build:" && env

# Instala as dependências
COPY package*.json /github/workspace/
WORKDIR /github/workspace
RUN npm install

# Copia todos os arquivos do projeto
COPY . /github/workspace

# Confirma a estrutura de arquivos
RUN echo "Estrutura de arquivos no workspace durante o build:" && ls -la /github/workspace

# Adiciona comandos de debug antes do CMD
ENTRYPOINT ["sh", "-c", " \
  echo '--- Debug do ambiente de execução ---' && \
  echo 'Diretório atual:' && pwd && \
  echo 'Estrutura de arquivos na raiz:' && ls -la / && \
  echo 'Estrutura de arquivos no workspace:' && ls -la /github/workspace && \
  echo 'Estrutura de arquivos detalhada no workspace:' && find /github/workspace && \
  echo 'Usuário atual:' && whoami && id && \
  echo 'Variáveis de ambiente no runtime:' && env && \
  echo '--- Fim do debug ---' && \
  node export-diagrams.js"]