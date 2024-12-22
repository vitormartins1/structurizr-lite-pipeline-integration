FROM node:16

# Configura o diretório de trabalho no container
WORKDIR /action

# Copia o conteúdo da Action para o container
COPY . .

# Instala as dependências
RUN npm install

# Garante que Puppeteer tenha o Chrome instalado
RUN npx puppeteer install

# Define o comando padrão para executar o script principal
CMD ["node", "export-diagrams.js"]