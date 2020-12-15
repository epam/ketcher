/****************************************************************************
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/* eslint-env node */

const fs = require('fs')
const ora = require('ora')
const svgstore = require('svgstore')
const cols = require('./collections')()
const browserSession = require('./browser-session')

const getSampleName = (collectionName, sample) => `${collectionName}/${sample}`

const getSvg = browser =>
  browser.execute(
    () => window.document.querySelector('#canvas-ketcher').innerHTML
  )

/**
  Generates test/fixutres/fixtures.svg used for comparisons in test/render/index.js
*/
browserSession(async (browser, testDir) => {
  await browser.url(`${testDir}/render/render-test.html`)

  const sprites = svgstore({
    copyAttrs: ['width', 'height', 'preserveAspectRatio']
  })

  for (var collectionName of cols.names()) {
    for (var sample of cols(collectionName).names()) {
      const sampleName = getSampleName(collectionName, sample)
      const spinner = ora(sampleName)
      spinner.start()

      const svg = await generateSvg(browser, collectionName, sample)

      sprites.add(sampleName, svg)
      spinner.succeed()
    }
  }

  fs.writeFileSync('test/fixtures/fixtures.svg', sprites)
})

async function generateSvg(browser, collectionName, sample) {
  const sampleName = getSampleName(collectionName, sample)
  const structStr = cols(collectionName).fixture(sample)
  const opts = { sample, width: 600, height: 400 }

  await browser.execute(
    (structStr, opts) => window.renderTest(structStr, opts),
    structStr,
    opts
  )

  return getSvg(browser)
}
