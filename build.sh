#!/usr/bin/env bash

# install anything new
npm install
# compile frontend code
npm run build

# cd to static directory
cd /dstore/data-portal-2.0/backend/static
# delete old ketcher static files
rm -rf ketcher
# move to our static ketcher source 
cd /dstore/data-portal-2.0/backend/static/ketcher
# move newly compiled files into our repo
cp -R /dstore/ketcher/dist/* 