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

import PropTypes from 'prop-types';
import Atom from '../../../../../../../component/view/Atom';
import clsx from 'clsx';

function MainRow({
  row,
  caption,
  refer,
  onAtomSelect,
  onDoubleClick,
  currentEvents,
  atomClassNames,
  className,
}) {
  const renderCell = (element, index) => {
    if (typeof element !== 'number') {
      return (
        <td key={index}>
          <Atom
            el={element}
            className={clsx(...atomClassNames(element))}
            onClick={() => onAtomSelect(element.label)}
            onDoubleClick={() => onDoubleClick()}
            {...currentEvents(element)}
          />
        </td>
      );
    }

    if (refer(element)) {
      return (
        <td key={index} className={className}>
          {refer(element)}
        </td>
      );
    }

    return <td key={index} colSpan={element} />;
  };

  return (
    <tbody>
      <tr>
        <th>{caption}</th>
        {row.map((element, index) => renderCell(element, index))}
      </tr>
    </tbody>
  );
}

MainRow.propTypes = {
  row: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  ).isRequired,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refer: PropTypes.func,
  onAtomSelect: PropTypes.func.isRequired,
  onDoubleClick: PropTypes.func.isRequired,
  currentEvents: PropTypes.func.isRequired,
  atomClassNames: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default MainRow;
