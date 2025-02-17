FROM mcr.microsoft.com/vscode/devcontainers/javascript-node

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive
RUN if [ `/usr/bin/dpkg --print-architecture` = 'arm64' ]; then \
    curl -L -o /tmp/gh.deb https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_linux_arm64.deb; \
else \
    curl -L -o /tmp/gh.deb https://github.com/cli/cli/releases/download/v2.67.0/gh_2.67.0_linux_amd64.deb; \
fi
RUN apt-get install -y /tmp/gh.deb