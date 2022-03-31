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

import classes from './Atom.module.less'
import clsx from 'clsx'
import { ElementColor } from 'ketcher-core'
import styled from '@emotion/styled'
import α from 'color-alpha'

function Atom({ el, shortcut, selected, ...props }) {
const atomColor = ElementColor[el.label] || '#000';
const AtomButton = styled('button')`
  color: ${atomColor};
  border-color: ${atomColor};
  &:hover {
    background-color: ${α(atomColor, .2)};
  }
  &:active {
    background-color: ${α(atomColor, .8)};
  }
  &.selected {
    color: #fff;
    background-color: ${α(atomColor, .8)};
  
    &:hover {
      background-color: ${atomColor};
    }
  }
`
  
  return (
    <AtomButton
      title={shortcut ? `${el.title} (${shortcut})` : el.title}
      className={clsx(classes.atom, {
        'selected': selected
      })}
      value={el.number}
      {...props}
    >
      <span>{el.label}</span>
    </AtomButton>
  )
}

export default Atom
