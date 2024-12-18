FROM node:18-slim

# Instalar dependências básicas
RUN apt-get update && apt-get install -y curl openjdk-17-jre

# Baixar o Structurizr Lite
WORKDIR /opt/structurizr
RUN curl -L -o structurizr-lite.war \
    https://github.com/structurizr/lite/releases/download/v2024.12.07/structurizr-lite.war

# Instalar Puppeteer
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install puppeteer

# Configurar o diretório de trabalho final
WORKDIR /workspace
RUN mkdir -p /workspace
EXPOSE 8080

# Executar o Structurizr Lite
CMD ["java", "-jar", "/opt/structurizr/structurizr-lite.war", "-workspace", "/workspace/workspace.dsl"]