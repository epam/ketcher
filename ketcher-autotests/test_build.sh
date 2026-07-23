#!/bin/sh
set -ex
cd /ketcher
npm i
npm run build:packages
npm run build:example:standalone
