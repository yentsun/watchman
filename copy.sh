#!/usr/bin/env bash

cd src
find . -name \*.ini -exec cp --parents {} ../build \;
find . -name \*.json -exec cp --parents {} ../build \;
