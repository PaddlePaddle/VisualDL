FROM nikolaik/python-nodejs:python3.8-nodejs14 AS builder

WORKDIR /home/visualdl
COPY . .

RUN apt-get update && apt-get -y --no-install-recommends install cmake && rm -rf /var/lib/apt/lists/*
RUN ["pip", "install", "--disable-pip-version-check", "-r", "requirements.txt"]
RUN ["python", "setup.py", "bdist_wheel"]


FROM python:3-alpine

WORKDIR /home/visualdl
COPY --from=builder /home/visualdl/dist/* dist/

RUN apk add --no-cache jpeg-dev zlib-dev
RUN apk add --no-cache --virtual .build-deps build-base linux-headers
RUN ["pip", "install", "--disable-pip-version-check", "--find-links=dist", "visualdl"]
RUN apk del .build-deps

ENTRYPOINT ["visualdl", "--logdir", "/home/visualdl/log", "--host", "0.0.0.0"]
