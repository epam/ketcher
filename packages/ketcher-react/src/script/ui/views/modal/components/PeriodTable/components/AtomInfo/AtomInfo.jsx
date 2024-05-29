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

import { ElementColor } from 'ketcher-core';
import classes from './AtomInfo.module.less';
import clsx from 'clsx';

function AtomInfo({ el, isInfo }) {
  const numberStyle = {
    color: ElementColor[el.label] || 'black',
    fontSize: '12px',
  };
  const elemStyle = {
    color: ElementColor[el.label] || 'black',
    fontWeight: 'bold',
    fontSize: '18px',
  };
  return (
    <div className={clsx(classes.ket_atom_info, !isInfo && classes.none)}>
      <div style={numberStyle}>{el.number}</div>
      <span style={elemStyle}>{el.label}</span>
      <br />
      {el.title}
      <br />
      {el.mass}
    </div>
  );
}

export default AtomInfo;
