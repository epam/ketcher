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

import { Icon, IconName } from 'components'
import classes from './SpecialSymbolsList.module.less'

const SpecialSymbolsList = ({ select }) => {
  const symbols: IconName[] = [
    'α',
    'β',
    'γ',
    'δ',
    'ε',
    'ζ',
    'η',
    'θ',
    'ι',
    'κ',
    'λ',
    'μ',
    'ν',
    'ξ',
    'ο',
    'π',
    'ρ',
    'σ',
    'τ',
    'υ',
    'φ',
    'χ',
    'ψ',
    'ω',
    '℃',
    '℉',
    'Å',
    '°',
    'ħ',
    '±',
    '‰',
    '√',
    '←',
    '→',
    '←/',
    '/→',
    '↔',
    '∏',
    '∑',
    '∞',
    '∂',
    '∆',
    '∫',
    '≈',
    '=/',
    '≤',
    '≥'
  ]
  return (
    <div className={classes.window}>
      {symbols.map((symbol, id) => {
        return (
          <button
            className={classes.button}
            key={`symbol-${id}`}
            value={symbol}
            onMouseDown={(event) => {
              select(event, symbol)
            }}
          >
            <Icon name={symbol} />
          </button>
        )
      })}
    </div>
  )
}
export { SpecialSymbolsList }
