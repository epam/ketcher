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

import React from 'react'
import styles from './FormulaInput.module.less'

const formulaRegexp = /\b(\d*)([A-Z][a-z]{0,3}#?)(\d*)\s*\b/g
const errorRegexp = /error:.*/g

function formulaInputMarkdown(formulaDescriptor) {
  return (
    formulaDescriptor?.length > 0 && (
      <div
        className={styles.chem_input}
        spellCheck="false"
        contentEditable
        suppressContentEditableWarning={true}>
        {formulaDescriptor.map(elementDescriptor => {
          return (
            <React.Fragment key={elementDescriptor.symbol}>
              {elementDescriptor.isotope > 0 && (
                <sup>{elementDescriptor.isotope}</sup>
              )}
              {elementDescriptor.symbol}
              {elementDescriptor.index > 0 && (
                <sub>{elementDescriptor.index}</sub>
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  )
}

function FormulaInput({ value }) {
  if (errorRegexp.test(value)) {
    return (
      <div
        className={styles.chem_input}
        spellCheck="false"
        contentEditable
        suppressContentEditableWarning={true}>
        {value}
      </div>
    )
  }

  const content = []
  let formulaDescriptor = []
  let matches
  let position = 0
  while ((matches = formulaRegexp.exec(value)) !== null) {
    let symbol
    let index = 0
    let isotope = 0
    if (matches[1].length > 0) {
      isotope = matches[1]
    }

    symbol = value.substring(position, matches.index) + matches[2]

    if (matches[3].length > 0) {
      index = matches[3]
    }

    formulaDescriptor.push({ symbol, index, isotope })
    position = matches.index + matches[0].length
  }

  if (position === 0) {
    content.push(value)
  } else {
    content.push(value.substring(position, value.length))
  }

  return formulaInputMarkdown(formulaDescriptor)
}

export default FormulaInput
