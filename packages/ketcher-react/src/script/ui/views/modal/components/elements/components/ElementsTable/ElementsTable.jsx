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
import element from '../../../../../../../chem/element'
import { Header, MainRow, OutinerRow } from './components'
import styles from './ElementsTable.module.less'
import clsx from 'clsx'

const metalPrefix = [
  'alkali',
  'alkaline-earth',
  'transition',
  'post-transition'
] // 'lanthanide', 'actinide'
const beforeSpan = {
  He: 16,
  B: 10,
  Al: 10,
  Hf: 1,
  Rf: 1
}
const main = rowPartition(
  element.filter(
    item => item && item.type !== 'actinide' && item.type !== 'lanthanide'
  )
)
const lanthanides = element.filter(item => item && item.type === 'lanthanide')
const actinides = element.filter(item => item && item.type === 'actinide')

function rowPartition(elements) {
  return elements.reduce((result, item) => {
    const row = result[item.period - 1]
    if (!row) {
      result.push([item])
    } else {
      if (beforeSpan[item.label]) row.push(beforeSpan[item.label])
      row.push(item)
    }
    return result
  }, [])
}

class ElementsTable extends Component {
  // eslint-disable-line
  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value
  }

  atomStyling = item => {
    const { selected } = this.props

    const type = metalPrefix.includes(item.type)
      ? `${item.type} metal`
      : item.type || 'unknown-props'

    const classes = [
      ...type.split(' '),
      item.state || 'unknown-state',
      item.origin,
      'button',
      selected(item.label) && 'selected'
    ]

    return classes.map(className => {
      return styles[className]
    })
  }

  render() {
    const { currentEvents, onSelect } = this.props
    const callbacks = { currentEvents, onSelect }
    return (
      <table
        className={styles.table}
        summary="Periodic table of the chemical elements">
        <Header />
        {main.map((row, index) => (
          <MainRow
            atomStyling={this.atomStyling}
            className={styles.main_row}
            key={index}
            row={row}
            caption={index + 1}
            refer={o => o === 1 && (index === 5 ? '*' : '**')}
            {...callbacks}
          />
        ))}
        <OutinerRow
          className={styles.outiner_row}
          row={lanthanides}
          caption="*"
          atomStyling={this.atomStyling}
          {...callbacks}
        />
        <OutinerRow
          className={styles.outiner_row}
          row={actinides}
          caption="**"
          atomStyling={this.atomStyling}
          {...callbacks}
        />
      </table>
    )
  }
}

export default ElementsTable
