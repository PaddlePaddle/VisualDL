#!/bin/bash

set -e

# rust toolchain
# https://rustup.rs/
curl https://sh.rustup.rs -sSf | sh -s -- --no-modify-path --default-toolchain nightly -y
source $HOME/.cargo/env

# wasm-pack
# https://rustwasm.github.io/wasm-pack/installer/
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# yarn install
yarn install --frozen-lockfile
