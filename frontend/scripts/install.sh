#!/bin/bash

set -ex

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

# yarn install
yarn install --frozen-lockfile
