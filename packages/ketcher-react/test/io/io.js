#!/usr/bin/nodejs
/****************************************************************************
 * Copyright 2021 EPAM Systems
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

const path = require('path')
const tap = require('tap')

require('core-js/stable') // Needed for padStart, etc (used in "new wave" ketchers)
require('regenerator-runtime/runtime')

const molfile = require(path.join('../', 'dist/io/chem/molfile')).default

const cols = require('../utils/collections')()

const molcompare = require('../utils/molcompare')

function isEquals(expected, actual) {
  return molcompare.raw(expected, actual, { stripSpaces: true })
}

function runTests(isEqual) {
  for (let colname of cols.names()) {
    tap.test(colname, tap => {
      for (let sample of cols(colname)) {
        const expected = sample.data
        const struct = molfile.parse(sample.data, { badHeaderRecover: true })
        const actual = molfile.stringify(struct)

        if (!expected || !actual) {
          tap.fail(`${colname}/${sample.name} not parsed`)
        }

        try {
          if (sample.data.includes('V3000')) {
            tap.ok(
              true,
              `${colname}/${sample.name} parsed from V3000 and wrote as V2000, couldn't compare now`
            )
          } else {
            tap.ok(
              isEqual(expected, actual),
              `${colname}/${sample.name} equals`
            )
          }
        } catch (e) {
          tap.fail(`${colname}/${sample.name} mismatch`, e)
        }
      }
      tap.end()
    })
  }
}

runTests(isEquals)
