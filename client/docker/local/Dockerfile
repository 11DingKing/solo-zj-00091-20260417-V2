ARG NODE_VERSION=18-alpine

FROM node:${NODE_VERSION} as node

FROM node as client-local-build

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

RUN npm config set registry https://registry.npmmirror.com

COPY ./package.json ./package-lock.json ./

RUN npm ci --legacy-peer-deps

COPY . ${APP_HOME}

CMD ["npm","start"]
