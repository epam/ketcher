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

import React from 'react'
import styles from './FormulaInput.module.less'

const formulaRegexp = /\b(\d*)([A-Z][a-z]{0,3}#?)(\d*)\s*\b/g
const errorRegexp = /error:.*/g

function formulaInputMarkdown(value) {
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

function FormulaInput(props) {
  const { value } = props

  if (errorRegexp.test(value)) {
    return formulaInputMarkdown(value)
  }

  const content = []
  let matches
  let position = 0

  while ((matches = formulaRegexp.exec(value)) !== null) {
    if (matches[1].length > 0) {
      content.push(<sup>{matches[1]}</sup>)
    }
    content.push(value.substring(position, matches.index) + matches[2])
    if (matches[3].length > 0) {
      content.push(<sub key={matches}>{matches[3]}</sub>)
    }
    position = matches.index + matches[0].length
  }

  if (position === 0) {
    content.push(value)
  } else {
    content.push(value.substring(position, value.length))
  }

  return formulaInputMarkdown(content)
}

export default FormulaInput
