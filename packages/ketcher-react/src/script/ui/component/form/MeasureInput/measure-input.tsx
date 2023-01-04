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

import { useEffect, useState, useCallback } from 'react'

import Input from '../input'
import Select from '../Select'
import styles from './measure-input.module.less'
import { getSelectOptionsFromSchema } from '../../../utils'

const selectOptions = getSelectOptionsFromSchema({
  enum: ['cm', 'px', 'pt', 'inch']
})

const MeasureInput = ({ schema, value, onChange, name, ...rest }) => {
  const [measure, setMeasure] = useState('px')
  const [cust, setCust] = useState(value || schema.default)

  useEffect(() => {
    if (measure === 'px' && cust?.toFixed() - 0 !== value) {
      setMeasure('px')
      setCust(value)
    } // Hack: Set init value (RESET)
  }, [cust, measure, value])

  const handleChange = (value) => {
    const convValue = convertValue(value, measure, 'px')
    setCust(value)
    onChange(convValue)
  }

  const handleMeasChange = (m) => {
    setCust((prev) => {
      convertValue(prev, measure, m)
    })
    setMeasure(m)
  }

  const calcValue = useCallback(() => {
    const newValue = convertValue(value, 'px', measure)
    setCust(newValue)
  }, [value, measure])

  useEffect(() => {
    calcValue()
  }, [calcValue])

  const desc = schema || schema.properties[name]

  return (
    <div className={styles.measureInput} {...rest}>
      <span>{rest.title || desc.title}</span>
      <div style={{ display: 'flex' }}>
        <Input
          schema={schema}
          step={measure === 'px' || measure === 'pt' ? '1' : '0.001'}
          value={cust}
          onChange={handleChange}
        />
        <Select
          onChange={handleMeasChange}
          options={selectOptions}
          value={measure}
          className={styles.select}
        />
      </div>
    </div>
  )
}

const measureMap = {
  px: 1,
  cm: 37.795278,
  pt: 1.333333,
  inch: 96
}

function convertValue(value, measureFrom, measureTo) {
  if ((!value && value !== 0) || isNaN(value)) return null // eslint-disable-line

  return measureTo === 'px' || measureTo === 'pt'
    ? Number(
        ((value * measureMap[measureFrom]) / measureMap[measureTo]).toFixed()
      ) - 0
    : Number(
        ((value * measureMap[measureFrom]) / measureMap[measureTo]).toFixed(3)
      ) - 0
}

export default MeasureInput
