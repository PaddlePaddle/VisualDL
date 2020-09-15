#!/bin/bash

set -e

# rust toolchain
# https://rustup.rs/
if ! hash rustup 2>/dev/null; then
    curl https://sh.rustup.rs -sSf | sh -s -- --no-modify-path -y
    PATH="$HOME/.cargo/bin:$PATH"
fi


# wasm-pack
# wasm-pack will be installed by npm package
# https://rustwasm.github.io/wasm-pack/installer/
# if ! hash wasm-pack 2>/dev/null; then
#     curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
# fi


# yarn
if ! hash yarn 2>/dev/null; then
    curl --compressed -o- -L https://yarnpkg.com/install.sh | bash
    PATH="$HOME/.yarn/bin:$HOME/.config/yarn/global/node_modules/.bin:$PATH"
fi

export PATH=$PATH

# yarn install
yarn install --frozen-lockfile --network-timeout 1000000

# re-install esbuild
# I don't know why...
# but this works in docker...
(cd node_modules/esbuild && rm -f stamp.txt && node install.js)
