FROM node:18-slim

# Instalar dependências básicas
RUN apt-get update && apt-get install -y curl unzip openjdk-17-jre

# Baixar o Structurizr CLI
WORKDIR /opt/structurizr
ADD https://github.com/structurizr/cli/releases/download/v1.23.0/structurizr-cli.zip .
RUN unzip structurizr-cli.zip && rm structurizr-cli.zip

# Instalar Puppeteer
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install puppeteer

# Configurar o diretório de trabalho
WORKDIR /workspace