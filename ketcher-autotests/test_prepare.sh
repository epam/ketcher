#!/bin/sh
set -ex

cd /app
npm i
npx playwright install chromium
