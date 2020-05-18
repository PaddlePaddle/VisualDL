FROM nikolaik/python-nodejs:python3.8-nodejs14

WORKDIR /home/visualdl

COPY . /home/visualdl

RUN ["apt", "update"]
RUN ["apt", "-y", "install", "cmake"]
RUN ["pip", "install", "-r", "requirements.txt"]

CMD ["python", "setup.py", "bdist_wheel"]
