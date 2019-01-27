# Build script for Windows
# Requires: PowerShell, Python 3, Visual Studio 15 2017

$TOP_DIR=$pwd.PATH
$FRONTEND_DIR="$TOP_DIR/frontend"
$BACKEND_DIR="$TOP_DIR/visualdl"
$BUILD_DIR="$TOP_DIR/build"

mkdir $BUILD_DIR -ErrorAction Ignore

function check_duplicated($filename_format) {
    $files = ls dist/$filename_format -ErrorAction Ignore
    if (Get-TypeName($files.Length) -ne "FileInfo") {
      Write-Error "dist have duplicate file for $filename_format, please clean and rerun"
      exit(1)
    }
}

function build_frontend() {
    cd $FRONTEND_DIR
    npm install
    npm run build
    foreach ($file_name in "manifest.*.js","index.*.js","vendor.*.js") {
        echo $file_name
        check_duplicated $file_name
    }
}

function build_frontend_fake() {
    cd $FRONTEND_DIR
    mkdir -p dist
}

function build_backend() {
    cd $BUILD_DIR
    cmake -G "Visual Studio 15 2017 Win64" `
        -DCMAKE_BUILD_TYPE=Release `
        -DON_RELEASE=ON `
        -DWITH_PYTHON3=ON `
        -DWITH_TESTING=OFF `
        -DBUILD_FOR_HOST:BOOL=YES ..
    cmake --build . --config Release
}

function build_onnx_graph() {
    $env:PATH = "$BUILD_DIR/third_party/protobuf/src/extern_protobuf-build/Release;" + $env:PATH
    cd $TOP_DIR/visualdl/server/model/onnx
    protoc onnx.proto --python_out .
    cd $TOP_DIR/visualdl/server/model/paddle
    protoc framework.proto --python_out .
}

function clean_env() {
    rm -Recurse -Force -ErrorAction Ignore $TOP_DIR/visualdl/server/dist
    rm -Recurse -Force -ErrorAction Ignore $BUILD_DIR/bdist*
    rm -Recurse -Force -ErrorAction Ignore $BUILD_DIR/lib*
    rm -Recurse -Force -ErrorAction Ignore $BUILD_DIR/temp*
    rm -Recurse -Force -ErrorAction Ignore $BUILD_DIR/scripts*
}

function package() {
    cp -Recurse $FRONTEND_DIR/dist $TOP_DIR/visualdl/server/
    cp $BUILD_DIR/visualdl/logic/Release/core.pyd $TOP_DIR/visualdl
    cp $BUILD_DIR/visualdl/logic/Release/core.pyd $TOP_DIR/visualdl/python/
}

build_frontend
clean_env
build_backend
build_onnx_graph
package
