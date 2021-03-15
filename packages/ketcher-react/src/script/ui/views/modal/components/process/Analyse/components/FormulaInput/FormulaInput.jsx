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

function renderFormula(formula, key) {
  return formula.elements.map((element, index) => {
    return (
      <React.Fragment key={index}>
        {element.isotope > 0 && <sup>{element.isotope}</sup>}
        {element.symbol}
        {element.index > 0 && <sub>{element.index}</sub>}
      </React.Fragment>
    )
  })
}

function renderGroup(group, key, renderBrakets) {
  return group.formulas.map((formula, index) => {
    return (
      <React.Fragment key={index}>
        {renderFormula(formula)}
        {index < group.formulas.length - 1 && group.formulas.length > 1 && '; '}
      </React.Fragment>
    )
  })
}

function formulaInputMarkdown(descriptor) {
  return (
    <div className={styles.chem_input}>
      {descriptor?.groups.length > 0 &&
        descriptor.groups.map((group, index) => {
          return (
            <React.Fragment key={index}>
              {<>{descriptor.groups.length > 1 && '['}</>}
              {renderGroup(group, index, descriptor.groups.length > 1)}
              {<>{descriptor.groups.length > 1 && ']'}</>}
              {descriptor.groups.length > 1 &&
                index < descriptor.groups.length - 1 &&
                ' > '}
            </React.Fragment>
          )
        })}
    </div>
  )
}

function FormulaInput({ value }) {
  if (errorRegexp.test(value)) {
    return <div className={styles.chem_input}>{value}</div>
  }

  const descriptor = value
    .split('>')
    .map(group => {
      return group
        .trim()
        .split(';')
        .reduce(
          (acc, formula) => {
            let match
            const elements = []
            do {
              match = formulaRegexp.exec(formula)
              if (match) {
                const isotope = match[1]
                const symbol = match[2]
                const index = match[3]

                elements.push({ symbol, index, isotope })
              }
            } while (match)

            if (elements.length) {
              acc.formulas.push({ elements })
            }

            return acc
          },
          { formulas: [] }
        )
    })
    .reduce(
      (acc, group) => {
        acc.groups.push(group)
        return acc
      },
      { groups: [] }
    )

  return formulaInputMarkdown(descriptor)
}

export default FormulaInput
