#!/bin/sh
set -ex
cd /ketcher/example/
nohup npm run serve:standalone&
cd /app
npx playwright test "$@"
