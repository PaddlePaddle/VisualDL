FROM nikolaik/python-nodejs:python3.8-nodejs14 AS builder
WORKDIR /home/visualdl
COPY . .
RUN ["apt", "update"]
RUN ["apt", "-y", "--no-install-recommends", "install", "cmake"]
RUN ["pip", "install", "-r", "requirements.txt"]
RUN ["python", "setup.py", "bdist_wheel"]

FROM python:3
WORKDIR /home/visualdl
COPY --from=builder /home/visualdl/dist/* dist/
RUN ["pip", "install", "--find-links=dist", "visualdl"]
ENTRYPOINT ["visualdl", "--logdir", "/home/visualdl/log"]
