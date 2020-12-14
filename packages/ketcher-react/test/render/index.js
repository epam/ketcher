/****************************************************************************
 * Copyright 2020 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *		http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

/* eslint-env node */
const ora = require('ora')
const tap = require('tap')
const istanbul = require('istanbul')

const libSymbol = require('../utils/library')
const cols = require('../utils/collections')()
const browserSession = require('../utils/browser-session')

const MISMATCH_THRESHOLD = 0.5
const getMismatch = async browser => {
  const mismatch = await browser.execute(function () {
    return window.document.querySelector('#cmp').innerText
  })
  return parseFloat(mismatch.replace(/Mismatch:\s/, ''))
}

const comparisonResult = (sampleName, mismatch) => `${sampleName} - ${mismatch}`

/**
	Run comparison tests in browser
*/
browserSession(async (browser, testDir) => {
  await browser.url(`file://${testDir}/render/render-test.html`)

  for (let collectionName of cols.names()) {
    await runCollectionTests(browser, collectionName)
  }

  return generateCoverage(browser)
})

async function runCollectionTests(browser, collectionName) {
  return tap.test(collectionName, async t => {
    for (let name of cols(collectionName).names()) {
      const sampleName = `${collectionName}/${name}`
      const structStr = cols(collectionName).fixture(name)
      const symbol = libSymbol(sampleName) // string Symbol element from `fixtures.svg`
      const opts = { sample: sampleName, width: 600, height: 400 }

      const spinner = ora(sampleName)
      spinner.start()

      await browser.execute(
        function (structStr, symbol, opts) {
          window.compareTest(structStr, symbol, opts)
        },
        structStr,
        symbol,
        opts
      )

      const mismatch = await getMismatch(browser)
      spinner.succeed(comparisonResult(sampleName, mismatch))
      t.ok(mismatch < MISMATCH_THRESHOLD, `${sampleName}`)
    }

    t.end()
  })
}

function generateCoverage(browser) {
  return browser
    .execute(function () {
      return window.__coverage__
    })
    .then(cover => {
      const reporter = new istanbul.Reporter()
      const collector = new istanbul.Collector()
      collector.add(cover)
      reporter.add('html') // istanbul.Report.getReportList()
      reporter.write(collector, true, () => null)
    })
    .catch(e => {
      console.error('Problem occurred when generating coverage report')
      console.error(e)
    })
}
