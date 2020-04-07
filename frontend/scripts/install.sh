#!/bin/bash

set -e

# rust toolchain
# https://rustup.rs/
if ! hash rustup 2>/dev/null; then
    curl https://sh.rustup.rs -sSf | sh -s -- --no-modify-path --default-toolchain nightly -y
    source $HOME/.cargo/env
fi


# wasm-pack
# https://rustwasm.github.io/wasm-pack/installer/
if ! hash wasm-pack 2>/dev/null; then
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi


# wine
sudo dpkg --add-architecture i386
wget -nc https://download.opensuse.org/repositories/Emulators:/Wine:/Debian/xUbuntu_18.04/Release.key
sudo apt-key add Release.key
sudo apt-add-repository 'deb https://download.opensuse.org/repositories/Emulators:/Wine:/Debian/xUbuntu_18.04/ ./'

wget -nc https://dl.winehq.org/wine-builds/winehq.key
sudo apt-key add winehq.key
sudo apt-add-repository 'deb https://dl.winehq.org/wine-builds/ubuntu/ bionic main'

sudo apt update
sudo apt install --install-recommends winehq-stable


# yarn
curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
export PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"


# yarn install
yarn install --frozen-lockfile
