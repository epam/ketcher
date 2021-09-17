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

import Atom from '../../../../../../../component/view/Atom'
import clsx from 'clsx'

function MainRow({
  row,
  caption,
  refer,
  onSelect,
  currentEvents,
  atomClassNames,
  className
}) {
  return (
    <tbody>
      <tr>
        <th>{caption}</th>
        {row.map((element, index) =>
          typeof element !== 'number' ? ( // eslint-disable-line
            <td key={index}>
              <Atom
                el={element}
                className={clsx(...atomClassNames(element))}
                onClick={() => onSelect(element.label)}
                {...currentEvents(element)}
              />
            </td>
          ) : refer(element) ? (
            <td key={index} className={className}>
              {refer(element)}
            </td>
          ) : (
            <td key={index} colSpan={element} />
          )
        )}
      </tr>
    </tbody>
  )
}

export default MainRow
