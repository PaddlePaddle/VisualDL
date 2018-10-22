#!/usr/bin/env bash

if [[ "$TRAVIS_PULL_REQUEST" != "false" ]]; then exit 0; fi;

if [ "$TRAVIS_BRANCH" == "develop_doc" ]; then
    PPO_SCRIPT_BRANCH=develop_doc
elif [[ "$TRAVIS_BRANCH" == "develop" ]]; then
    PPO_SCRIPT_BRANCH=master
else
    exit 0;
fi

export DEPLOY_DOCS_SH=https://raw.githubusercontent.com/PaddlePaddle/PaddlePaddle.org/$PPO_SCRIPT_BRANCH/scripts/deploy/deploy_docs.sh
export DOCS_DIR=`pwd`
cd ..

curl $DEPLOY_DOCS_SH | bash -s $CONTENT_DEC_PASSWD $TRAVIS_BRANCH $DOCS_DIR $DOCS_DIR/docs $PPO_SCRIPT_BRANCH
