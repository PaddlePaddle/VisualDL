#!/bin/bash

set -e

# rust toolchain
# https://rustup.rs/
curl https://sh.rustup.rs -sSf | sh -s -- --default-toolchain nightly -y
PATH="$HOME/.cargo/env:$PATH"

# wasm-pack
# https://rustwasm.github.io/wasm-pack/installer/
curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh

# binaryen
# https://github.com/WebAssembly/binaryen
mkdir build && cd build
git clone https://github.com/WebAssembly/binaryen.git
(cd binaryen && cmake . && make)
export PATH="`pwd`/binaryn/bin:$PATH"
cd ..

yarn
