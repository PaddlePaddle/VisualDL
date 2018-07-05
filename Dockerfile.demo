FROM tatsushid/tinycore-python:2.7

RUN pip install visualdl
WORKDIR /
COPY ./demo/vdl_create_scratch_log vdl_create_scratch_log
RUN python /vdl_create_scratch_log

ENTRYPOINT ["visualdl", "--logdir=/scratch_log"]