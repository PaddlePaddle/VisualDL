FROM node:14 AS builder
WORKDIR /home/visualdl
COPY . .
ENV SCOPE server
RUN ["./scripts/install.sh"]
RUN ["./scripts/build.sh"]

FROM node:14-alpine

WORKDIR /home/visualdl
COPY --from=builder /home/visualdl/output/server.tar.gz /tmp

ENV NODE_ENV production

RUN apk update && \
    apk upgrade && \
    apk add --no-cache --virtual .build-deps git && \
    tar zxf /tmp/server.tar.gz && \
    rm /tmp/server.tar.gz && \
    yarn install --no-lockfile && \
    yarn cache clean && \
    apk del --no-network .build-deps

ENTRYPOINT ["yarn", "start"]
