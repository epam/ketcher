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

import { AtomInfo, ElementsTable, TypeChoice } from './components';
import { fromElement, toElement } from '../../../../data/convert/structconv';

import { Component } from 'react';
import { Dialog } from '../../../components';
import { Element, Elements } from 'ketcher-core';
import { addAtoms } from '../../../../state/toolbar';
import classes from './PeriodTable.module.less';
import { connect } from 'react-redux';
import { onAction } from '../../../../state';
import { xor } from 'lodash/fp';
import { Icon } from 'components';

type AtomType = 'atom' | 'gen' | 'list' | 'not-list';

interface AtomResult {
  label: string;
  pseudo: string | null;
}

interface GenResult {
  type: 'gen';
  label: string;
  pseudo: string;
}

interface ListResult {
  type: 'list' | 'not-list';
  values: string[];
}

type PeriodTableResult = AtomResult | GenResult | ListResult | null;

interface TableOwnProps {
  type?: AtomType;
  values?: string[];
  label?: string;
  pseudo?: string;
  isNestedModal?: boolean;
  onOk: (result: PeriodTableResult) => void;
  onCancel: () => void;
}

interface TableStateProps {
  isMonomerCreationWizardActive: boolean;
  type?: AtomType;
  values?: string[];
  label?: string;
  pseudo?: string;
}

interface TableDispatchProps {
  onOk: (result: PeriodTableResult) => void;
}

type TableProps = TableOwnProps & TableStateProps & TableDispatchProps;

interface TableState {
  type: AtomType;
  value: string | string[] | null;
  current: Element;
  isInfo: boolean;
}

class Table extends Component<TableProps, TableState> {
  constructor(props: TableProps) {
    super(props);
    const heliumElement = Elements.get(2);
    this.state = {
      type: props.type || 'atom',
      value: props.values || (!props.pseudo ? props.label : null) || null,
      current: heliumElement || ({} as Element),
      isInfo: false,
    };
  }

  changeType = (type: AtomType) => {
    const prevChoice =
      this.state.type === 'list' || this.state.type === 'not-list';
    const currentChoice = type === 'list' || type === 'not-list';
    if (prevChoice && currentChoice) {
      this.setState({ type });
    } else {
      this.setState({
        type,
        value: type === 'atom' || type === 'gen' ? null : [],
      });
    }
  };

  headerContent = () => (
    <div className={classes.dialogHeader}>
      <Icon name="period-table" />
      <span>Periodic Table</span>
    </div>
  );

  selected = (label: string): boolean => {
    const { type, value } = this.state;
    return type === 'atom' || type === 'gen'
      ? value === label
      : Array.isArray(value) && value.includes(label);
  };

  onAtomSelect = (label?: string, activateImmediately = false) => {
    if (activateImmediately) {
      const result = this.result();
      const { type } = this.state;
      if (result && type === 'atom') {
        this.props.onOk(this.result());
      }
    } else if (label) {
      const { type, value } = this.state;
      this.setState({
        value:
          type === 'atom' || type === 'gen'
            ? label
            : xor([label], Array.isArray(value) ? value : []),
      });
    }
  };

  result = (): PeriodTableResult => {
    const { type, value } = this.state;
    if (!value || (Array.isArray(value) && !value.length)) {
      return null;
    }
    if (type === 'atom') {
      return { label: value as string, pseudo: null };
    } else if (type === 'gen') {
      return { type, label: value as string, pseudo: value as string };
    }
    return { type, values: value as string[] };
  };

  currentEvents = (element: Element) => {
    return {
      onMouseEnter: () => this.setState({ current: element, isInfo: true }),
      onMouseLeave: () => this.setState({ isInfo: false }),
    };
  };

  render() {
    const { value } = this.state;
    const HeaderContent = this.headerContent;

    // Cast props to satisfy the Dialog component's expectations
    // The Dialog component expects a looser type for onOk
    const dialogParams = this.props as unknown as {
      onCancel: () => void;
      onOk: (result: unknown) => void;
      isNestedModal?: boolean;
    };

    return (
      <Dialog
        headerContent={<HeaderContent />}
        className={classes.elementsTable}
        params={dialogParams}
        result={this.result}
        buttons={['Cancel', 'OK']}
        buttonsNameMap={{ OK: 'Add' }}
        needMargin={false}
        footerContent={
          !this.props.isNestedModal ? (
            <TypeChoice
              value={this.state.type}
              onChange={this.changeType}
              disabled={this.props.isMonomerCreationWizardActive}
            />
          ) : undefined
        }
      >
        <div className={classes.periodTable}>
          <AtomInfo el={this.state.current} isInfo={this.state.isInfo} />
          <ElementsTable
            value={value}
            currentEvents={this.currentEvents}
            selected={this.selected}
            onAtomSelect={(label) => this.onAtomSelect(label)}
            onDoubleClick={(label) => this.onAtomSelect(label, true)}
          />
        </div>
      </Dialog>
    );
  }
}

interface RootState {
  editor: {
    isMonomerCreationWizardActive: boolean;
  };
}

function mapSelectionToProps(
  editor: Record<string, any>, // eslint-disable-line @typescript-eslint/no-explicit-any
): Partial<TableStateProps> {
  const selection = editor.selection();

  if (
    selection &&
    Object.keys(selection).length === 1 &&
    selection.atoms &&
    Object.keys(selection.atoms).length === 1
  ) {
    const struct = editor.struct();
    const atom = struct.atoms.get(selection.atoms[0]);
    return { ...fromElement(atom) };
  }

  return {};
}

const mapStateToProps = (
  state: RootState,
  ownProps: TableOwnProps,
): TableStateProps => {
  const result: TableStateProps = {
    isMonomerCreationWizardActive: state.editor.isMonomerCreationWizardActive,
  };

  if (ownProps.values || ownProps.label) {
    return result;
  }

  const selectionProps = mapSelectionToProps(state.editor);

  return { ...selectionProps, ...result };
};

const mapDispatchToProps = (
  dispatch: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ownProps: TableOwnProps,
): TableDispatchProps => {
  return {
    onOk: (result: PeriodTableResult) => {
      if (!result) return;
      const hasType = 'type' in result;
      if (!hasType) {
        dispatch(addAtoms(result.label));
      }
      if (!ownProps.isNestedModal) {
        dispatch(
          onAction({
            tool: 'atom',
            opts: toElement(result),
          }),
        );
      }
      ownProps.onOk(result);
    },
  };
};

const PeriodTable = connect(mapStateToProps, mapDispatchToProps)(Table as any); // eslint-disable-line @typescript-eslint/no-explicit-any

export default PeriodTable;
