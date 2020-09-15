FROM nikolaik/python-nodejs:python3.8-nodejs14 AS builder

WORKDIR /home/visualdl
COPY . .

RUN apt-get update && apt-get -y --no-install-recommends install cmake && rm -rf /var/lib/apt/lists/*
RUN pip install --disable-pip-version-check -r requirements.txt && python setup.py bdist_wheel


FROM python:3-alpine

WORKDIR /home/visualdl
COPY --from=builder /home/visualdl/dist/* dist/

RUN apk add --no-cache jpeg-dev && \
    apk add --no-cache --virtual .build-deps build-base linux-headers zlib-dev && \
    pip install --disable-pip-version-check --find-links=dist visualdl && \
    apk del --no-network .build-deps && \
    rm -rf dist

ENTRYPOINT ["visualdl", "--logdir", "/home/visualdl/log", "--host", "0.0.0.0"]
