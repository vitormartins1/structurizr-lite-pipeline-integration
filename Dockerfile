FROM ghcr.io/puppeteer/puppeteer:22.15.0

# Use root as GitHub Actions requires Docker actions to run as root
USER root

# Debug variables during the build phase
RUN echo "Build-time environment variables:" && env

# Copy only package.json and package-lock.json first for efficient layer caching
COPY package*.json /github/workspace/

# Install dependencies
RUN echo "Before npm install" && ls -la /github/workspace && \
    npm install --prefix /github/workspace && \
    echo "After npm install" && ls -la /github/workspace

# Copy the rest of the application files
COPY . /github/workspace

# Add debugging to check the structure during the build
RUN echo "Filesystem structure during build:" && \
    find / -maxdepth 2 && \
    echo "Workspace structure during build:" && ls -la /github/workspace

# Set up the entry point with debugging commands
ENTRYPOINT ["/bin/sh", "-c", " \
  echo '--- Debug runtime environment ---' && \
  echo 'Current directory:' && pwd && \
  echo 'Filesystem structure at root:' && ls -la / && \
  echo 'Workspace structure:' && ls -la /github/workspace && \
  echo 'Detailed workspace structure:' && find /github/workspace && \
  echo 'Current user:' && whoami && id && \
  echo 'Runtime environment variables:' && env && \
  echo '--- End of debug ---' && \
  node /github/workspace/export-diagrams.js"]