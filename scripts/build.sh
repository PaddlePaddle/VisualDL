#!/bin/bash
set -e

TOP_DIR=$(pwd)
FRONTEND_DIR=${TOP_DIR}/frontend
BUILD_DIR=${TOP_DIR}/build

mkdir -p "$BUILD_DIR"

build_frontend_fake() {
    mkdir -p "$BUILD_DIR/package/dist"
}

build_frontend_from_source() {
    build_frontend_fake

    cd "$FRONTEND_DIR"
    ./scripts/install.sh
    ./scripts/build.sh

    # extract
    tar zxf "$FRONTEND_DIR/output/serverless.tar.gz" -C "$BUILD_DIR/package/serverless"
}

build_frontend() {
    local PACKAGE="@visualdl/serverless"
    local NAME=${PACKAGE#*@}
    local NAME=${NAME////-}
    echo ${NAME}
    local TAG="latest"
    local TARBALL="${PACKAGE}@${TAG}"

    # get version
    local VERSION
    VERSION=$(npm view ${TARBALL} dist-tags.${TAG})
    # shellcheck disable=SC2181
    if [[ "$?" -ne "0" ]]; then
        echo "Cannot get version"
        exit 1
    fi
    local FILENAME="${NAME}-${VERSION}.tgz"

    # get sha1sum
    local SHA1SUM;
    SHA1SUM=$(npm view ${TARBALL} dist.shasum)
    # shellcheck disable=SC2181
    if [[ "$?" -ne "0" ]]; then
        echo "Cannot get sha1sum"
        exit 1
    fi
    rm -f "$BUILD_DIR/${NAME}-*.tgz.sha1"
    echo "${SHA1SUM} ${FILENAME}" > "$BUILD_DIR/${FILENAME}.sha1"

    local DOWNLOAD="1"
    # cached file exists
    if [[ -f "$BUILD_DIR/$FILENAME" ]]; then
        # check sha1sum
        (cd "$BUILD_DIR" && sha1sum -c "${FILENAME}.sha1")
        # check pass, use cached file
        # shellcheck disable=SC2181
        if [[ "$?" -eq "0" ]]; then
            echo "Using cached npm package file ${FILENAME}"
            DOWNLOAD="0"
        fi
    fi

    if [[ "$DOWNLOAD" -eq "1" ]]; then
        echo "Downloading npm package, please wait..."

        # remove cache
        rm -f "$BUILD_DIR/${NAME}-*.tgz"

        # download file
        FILENAME=$( (cd "$BUILD_DIR" && npm pack ${TARBALL}) )

        # check sha1sum of downloaded file
        (cd "BUILD_DIR" && sha1sum -c "${FILENAME}.sha1")
        # shellcheck disable=SC2181
        if [[ "$?" -ne "0" ]]; then
            echo "Check sum failed, download may not finish correctly."
            exit 1
        else
            echo "Check sum pass."
        fi
    fi

    # extract
    tar zxf "$BUILD_DIR/$FILENAME" -C "$BUILD_DIR"
}

clean_env() {
    rm -rf "$TOP_DIR/visualdl/server/dist"
    rm -rf "$BUILD_DIR/bdist*"
    rm -rf "$BUILD_DIR/lib*"
    rm -rf "$BUILD_DIR/temp*"
    rm -rf "$BUILD_DIR/scripts*"
    rm -rf "$BUILD_DIR/package"
}

package() {
    cp -rf "$BUILD_DIR/package/dist" "$TOP_DIR/visualdl/server/"
}

ARG=$1
echo "ARG: ${ARG}"

clean_env

if [[ "$ARG" = "travis-CI" ]]; then
    build_frontend_fake
elif [[ "$ARG" = "from-source" ]]; then
    build_frontend_from_source
else
    build_frontend
fi

package
