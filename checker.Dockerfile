FROM node:22-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY src/checker ./src/checker

USER node
ENTRYPOINT ["node", "src/checker/cli.js"]
