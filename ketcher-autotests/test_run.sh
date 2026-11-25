#!/bin/sh
set -ex
cd /ketcher/example/
nohup node ../node_modules/serve/build/main.js dist/standalone -c serve.json -l tcp://127.0.0.1:4002 &
sleep 2
cd /app
npx playwright test "$@"
