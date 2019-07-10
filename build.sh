#!/usr/bin/env bash

# install anything new
npm install || { echo 'Ketcher npm install failed' ; exit 1; }
# compile frontend code
npm run build || { echo 'Ketcher npm build failed' ; exit 1; } 

# cd to static directory
cd /dstore/data-portal-2.0/backend/static
# delete old ketcher static files
rm -rf ketcher
# create new dir for static files
mkdir ketcher
# move newly compiled files into our repo
cp -R /dstore/ketcher/dist/* ketcher/ 

# move to data portal repo
cd /dstore/data-portal-2.0/frontend/
# build newly compiled ketcher files with our static files
npm run stage