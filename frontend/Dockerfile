FROM node:12-alpine

# Create app directory
WORKDIR /usr/src/app

ENV NODE_ENV production
ENV PORT 8999
ENV HOST 0.0.0.0

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY dist dist
COPY public public
COPY ecosystem.config.js ecosystem.config.js

EXPOSE 8999
ENTRYPOINT ["yarn", "start"]
