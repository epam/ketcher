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

import { Header, MainRow, OutinerRow } from './components';
import { Component } from 'react';

import { Elements, Element } from 'ketcher-core';
import styles from './ElementsTable.module.less';

const metalPrefix = [
  'alkali',
  'alkaline-earth',
  'transition',
  'post-transition',
]; // 'lanthanide', 'actinide'
const atomClassNames = {
  metal: 'metal',
  unknownProps: 'unknown-props',
  unknownState: 'unknown-state',
  button: 'button',
  selected: 'selected',
};
const beforeSpan: Record<string, number> = {
  He: 16,
  B: 10,
  Al: 10,
  Hf: 1,
  Rf: 1,
};
const ACTINIDE = 'actinide';
const LANTHANIDE = 'lanthanide';

type RowElement = Element | number;
type Row = RowElement[];

const main: Row[] = rowPartition(
  Elements.filter(
    (item) =>
      item &&
      item.type !== ACTINIDE &&
      item.type !== LANTHANIDE &&
      item.number !== 89 &&
      item.number !== 57,
  ),
);
const lanthanides: Element[] = Elements.filter(
  (item) => item && (item.type === LANTHANIDE || item.number === 57),
);
const actinides: Element[] = Elements.filter(
  (item) => item && (item.type === ACTINIDE || item.number === 89),
);

function rowPartition(elements: Element[]): Row[] {
  return elements.reduce((result: Row[], item: Element) => {
    const row = result[item.period - 1];
    if (!row) {
      result.push([item]);
    } else {
      if (beforeSpan[item.label]) row.push(beforeSpan[item.label]);
      row.push(item);
    }
    return result;
  }, []);
}

interface ElementsTableProps {
  value: string | string[] | null;
  currentEvents: (element: Element) => {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
  selected: (label: string) => boolean;
  onAtomSelect: (label: string) => void;
  onDoubleClick: (label?: string) => void;
}

class ElementsTable extends Component<ElementsTableProps> {
  shouldComponentUpdate(nextProps: ElementsTableProps): boolean {
    return nextProps.value !== this.props.value;
  }

  getAtomClassNames = (item: Element): string[] => {
    const { selected } = this.props;

    const type = metalPrefix.includes(item.type ?? '')
      ? `${item.type} ${atomClassNames.metal}`
      : item.type ?? atomClassNames.unknownProps;

    const classes = [
      ...type.split(' '),
      item.state ?? atomClassNames.unknownState,
      item.origin,
      atomClassNames.button,
      selected(item.label) && atomClassNames.selected,
    ];

    return classes.map((className) => {
      return styles[className as keyof typeof styles];
    });
  };

  render(): JSX.Element {
    const { currentEvents, onAtomSelect, onDoubleClick } = this.props;
    const callbacks = { currentEvents, onAtomSelect, onDoubleClick };
    return (
      <table
        className={styles.table}
        summary="Periodic table of the chemical elements"
      >
        <Header />
        {main.map((row, index) => (
          <MainRow
            atomClassNames={this.getAtomClassNames}
            className={styles.main_row}
            key={index}
            row={row}
            caption={index + 1}
            refer={(element: number) =>
              element === 1 && (index === 5 ? '*' : '**')
            }
            {...callbacks}
          />
        ))}
        <OutinerRow
          atomClassNames={this.getAtomClassNames}
          className={styles.outiner_row}
          row={lanthanides}
          caption="*"
          {...callbacks}
        />
        <OutinerRow
          atomClassNames={this.getAtomClassNames}
          className={styles.outiner_row}
          row={actinides}
          caption="**"
          {...callbacks}
        />
      </table>
    );
  }
}

export default ElementsTable;
