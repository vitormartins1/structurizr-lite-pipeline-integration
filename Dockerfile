FROM ghcr.io/puppeteer/puppeteer:22.15.0

# Use root as GitHub Actions requires Docker actions to run as root
USER root

# Debug variables during the build phase
# RUN echo "Build-time environment variables:" && env

# RUN echo "Instalando dependências no GITHUB_WORKSPACE:" && \
#     npm install --prefix $GITHUB_WORKSPACE && \
#     echo "Dependências instaladas com sucesso."

# Copy the necessary files for the Action into the container
COPY export-diagrams.js /app/export-diagrams.js
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

# Change ownership of the application files (if necessary)
RUN chown -R root:root /app

# Install dependencies
RUN npm install --prefix /app

# Copy only package.json and package-lock.json first for efficient layer caching
# COPY package*.json /github/workspace/

# Install dependencies
# RUN echo "Before npm install" && ls -la /github/workspace && \
#     npm install --prefix /github/workspace && \
#     echo "After npm install" && ls -la /github/workspace

# Copy the rest of the application files
# COPY . /github/workspace

# Add debugging to check the structure during the build
RUN echo "Filesystem structure during build:" && \
    find / -maxdepth 2 && \
    echo "Workspace structure during build:" && ls -la /

# Configura o ponto de entrada para rodar o script
# ENTRYPOINT ["/bin/sh", "-c", " \
#   echo '--- Debug runtime environment ---' && \
#   echo 'Current directory:' && pwd && \
#   echo 'Filesystem structure at root:' && ls -la / && \
#   echo 'Workspace structure:' && ls -la $GITHUB_WORKSPACE && \
#   echo 'Detailed workspace structure:' && find $GITHUB_WORKSPACE && \
#   echo 'Current user:' && whoami && id && \
#   echo 'Runtime environment variables:' && env && \
#   echo '--- End of debug ---' && \
#   node $GITHUB_WORKSPACE/export-diagrams.js"]
ENTRYPOINT ["node", "/app/export-diagrams.js"]