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

import React, { Component } from 'react'
import element from '../../../../../../../../chem/element'
import { Header, MainRow, OutinerRow } from './components'

const beforeSpan = {
  He: 16,
  B: 10,
  Al: 10,
  Hf: 1,
  Rf: 1
}
const main = rowPartition(
  element.filter(el => el && el.type !== 'actinide' && el.type !== 'lanthanide')
)
const lanthanides = element.filter(el => el && el.type === 'lanthanide')
const actinides = element.filter(el => el && el.type === 'actinide')

function rowPartition(elements) {
  return elements.reduce((res, el) => {
    const row = res[el.period - 1]
    if (!row) {
      res.push([el])
    } else {
      if (beforeSpan[el.label]) row.push(beforeSpan[el.label])
      row.push(el)
    }
    return res
  }, [])
}

class ElementsTable extends Component {
  // eslint-disable-line
  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value
  }

  render() {
    const { curEvents, selected, onSelect } = this.props
    const callbacks = { curEvents, selected, onSelect }
    return (
      <table summary="Periodic table of the chemical elements">
        <Header />
        {main.map((row, i) => (
          <MainRow
            key={i}
            row={row}
            caption={i + 1}
            refer={o => o === 1 && (i === 5 ? '*' : '**')}
            {...callbacks}
          />
        ))}
        <OutinerRow row={lanthanides} caption="*" {...callbacks} />
        <OutinerRow row={actinides} caption="**" {...callbacks} />
      </table>
    )
  }
}

export default ElementsTable
