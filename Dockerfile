FROM python:3-alpine as opencv

WORKDIR /opt

RUN apk add -U --no-cache --virtual=build-dependencies \
    build-base \
    clang \
    clang-dev ninja \
    cmake \
    freetype-dev \
    g++ \
    jpeg-dev \
    lcms2-dev \
    libffi-dev \
    libgcc \
    libxml2-dev \
    libxslt-dev \
    linux-headers \
    make \
    musl \
    musl-dev \
    openssl-dev \
    zlib-dev
RUN apk add --no-cache \
    curl \
    freetype \
    gcc \
    jpeg \
    libjpeg \
    tesseract-ocr \
    zlib

ENV OPENJPEG_VER 2.3.1
ENV OPENJPEG https://github.com/uclouvain/openjpeg/archive/v${OPENJPEG_VER}.tar.gz
RUN curl -L ${OPENJPEG} | tar zx && \
    cd openjpeg-${OPENJPEG_VER} && \
    mkdir build && \
    cd build && \
    cmake .. -DCMAKE_BUILD_TYPE=Release && \
    make && \
    make install && \
    make clean

ENV OPENCV_VER 4.3.0
ENV OPENCV https://github.com/opencv/opencv/archive/${OPENCV_VER}.tar.gz
RUN pip install numpy
RUN curl -L ${OPENCV} | tar zx && \
    cd opencv-${OPENCV_VER} && \
    mkdir build && \
    cd build && \
    cmake -G Ninja \
        -D CMAKE_BUILD_TYPE=RELEASE \
        -D CMAKE_INSTALL_PREFIX=/usr/local \
        -D WITH_FFMPEG=NO \
        -D WITH_IPP=NO \
        -D WITH_OPENEXR=NO \
        -D BUILD_DOCS=OFF \
        -D BUILD_EXAMPLES=OFF \
        -D BUILD_opencv_python2=OFF \
        -D BUILD_opencv_python3=ON \
        -D BUILD_NEW_PYTHON_SUPPORT=ON \
        -D HAVE_opencv_python3=ON \
        -D PYTHON_EXECUTABLE=$(which python) \
        -D PYTHON_INCLUDE_DIR=$(python -c "from distutils.sysconfig import get_python_inc; print(get_python_inc())") \
        -D PYTHON_INCLUDE_DIR2=$(python -c "from os.path import dirname; from distutils.sysconfig import get_config_h_filename; print(dirname(get_config_h_filename()))") \
        -D PYTHON_LIBRARY=$(python -c "from distutils.sysconfig import get_config_var;from os.path import dirname,join ; print(join(dirname(get_config_var('LIBPC')),get_config_var('LDLIBRARY')))") \
        -D PYTHON3_NUMPY_INCLUDE_DIRS=$(python -c "import numpy; print(numpy.get_include())") \
        -D PYTHON3_PACKAGES_PATH=$(python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())") \
        -D BUILD_WITH_DEBUG_INFO=OFF \
        -D BUILD_PACKAGE=OFF \
        -D BUILD_opencv_core=ON \
        -D BUILD_opencv_imgproc=ON \
        -D BUILD_opencv_imgcodecs=ON \
        -D BUILD_opencv_highgui=ON \
        -D BUILD_opencv_video=OFF \
        -D BUILD_opencv_videoio=OFF \
        -D BUILD_opencv_dnn=OFF \
        -D BUILD_opencv_apps=OFF \
        -D BUILD_opencv_flann=OFF \
        -D BUILD_opencv_gpu=OFF \
        -D BUILD_opencv_ml=OFF \
        -D BUILD_opencv_legacy=OFF \
        -D BUILD_opencv_calib3d=OFF \
        -D BUILD_opencv_features2d=OFF \
        -D BUILD_opencv_java=OFF \
        -D BUILD_opencv_objdetect=OFF \
        -D BUILD_opencv_photo=OFF \
        -D BUILD_opencv_nonfree=OFF \
        -D BUILD_opencv_ocl=OFF \
        -D BUILD_opencv_stitching=OFF \
        -D BUILD_opencv_superres=OFF \
        -D BUILD_opencv_ts=OFF \
        -D BUILD_opencv_videostab=OFF \
        -D BUILD_opencv_contrib=OFF \
        -D BUILD_SHARED_LIBS=ON \
        -D BUILD_TESTS=OFF \
        -D BUILD_PERF_TESTS=OFF \
        -D BUILD_WITH_CAROTENE=OFF \
        -D BUILD_PNG=ON \
        -D BUILD_JPEG=ON \
        -D BUILD_ZLIB=ON \
        -D BUILD_FAT_JAVA_LIB=OFF \
        -D OPENCV_CXX11=OFF \
        .. && \
    ninja && \
    ninja install && \
    ninja clean
RUN cp -p $(find `python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())"` -name cv2.*.so) $(python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())")/cv2.so
RUN tar zcf packages.tar.gz -C $(python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())") .


FROM nikolaik/python-nodejs:python3.8-nodejs14 AS builder

WORKDIR /home/visualdl
COPY . .

RUN apt-get update && apt-get -y --no-install-recommends install cmake && rm -rf /var/lib/apt/lists/*
RUN ["pip", "install", "-r", "requirements.txt"]
RUN ["python", "setup.py", "bdist_wheel"]


FROM python:3-alpine

WORKDIR /home/visualdl
COPY --from=opencv /usr/local/include/opencv* /usr/local/include/
COPY --from=opencv /usr/local/lib/* /usr/local/lib/
COPY --from=opencv /usr/local/lib64/* /usr/local/lib64/
COPY --from=opencv /opt/packages.tar.gz .
COPY --from=builder /home/visualdl/dist/* dist/
COPY requirements.txt .

RUN tar zxf packages.tar.gz -C $(python -c "from distutils.sysconfig import get_python_lib; print(get_python_lib())")
RUN apk add --no-cache jpeg-dev openjpeg-dev tiff-dev zlib-dev
RUN apk add --no-cache --virtual .build-deps build-base linux-headers
RUN sed -i -e '/opencv-python/d' requirements.txt
RUN ["pip", "install", "--disable-pip-version-check", "-r", "requirements.txt"]
RUN ["pip", "install", "--disable-pip-version-check", "--no-deps", "--find-links=dist", "visualdl"]

ENTRYPOINT ["visualdl", "--logdir", "/home/visualdl/log"]
