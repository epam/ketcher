#!/bin/sh
set -ex
cd /ketcher/example/
nohup npm run serve:standalone&
sleep 2
cd /app
npx playwright test "$@"
