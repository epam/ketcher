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
import { sketchingColors as elementColor } from '../../../../../../../chem/element-color'
import element from '../../../../../../../chem/element'
import clsx from 'clsx'

import classes from './AtomInfo.module.less'

function AtomInfo({ el, isInfo }) {
  const numberStyle = {
    color: elementColor[el.label] || 'black',
    fontSize: '1.2em'
  }
  const elemStyle = {
    color: elementColor[el.label] || 'black',
    fontWeight: 'bold',
    fontSize: '2em'
  }
  return (
    <div className={clsx(classes.ket_atom_info, !isInfo && classes.none)}>
      <div style={numberStyle}>{element.map[el.label]}</div>
      <span style={elemStyle}>{el.label}</span>
      <br />
      {el.title}
      <br />
      {el.atomic_mass}
    </div>
  )
}

export default AtomInfo
