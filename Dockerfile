FROM node:18-slim

# Instalar dependências básicas
RUN apt-get update && apt-get install -y curl unzip openjdk-17-jre

# Baixar o Structurizr CLI
WORKDIR /opt/structurizr
ADD https://github.com/structurizr/cli/releases/download/v2024.12.07/structurizr-cli.zip .
RUN unzip structurizr-cli.zip && rm structurizr-cli.zip

# Configurar dependências do Node.js
WORKDIR /usr/src/app
COPY package.json ./
# Se o package-lock.json não existir, remova-o da linha abaixo:
COPY package-lock.json ./
RUN npm install puppeteer

# Configurar o diretório de trabalho final
WORKDIR /workspace