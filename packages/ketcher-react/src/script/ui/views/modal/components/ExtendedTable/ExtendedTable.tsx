/****************************************************************************
 * Copyright 2022 EPAM Systems
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

import { fromElement, toElement } from '../../../../data/convert/structconv';

import { Dialog } from '../../../components';
import GenericGroups from './components/GenericGroups';
import classes from './ExtendedTable.module.less';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Editor } from 'ketcher-core';
import { onAction } from '../../../../state';
import { useState } from 'react';

interface GenericElement {
  type: 'gen';
  label: string;
  pseudo: string;
}

interface TableProps {
  pseudo?: string;
  label?: string;
  disabledQueryElements: Array<string> | null | undefined;
  isNestedModal?: boolean;
  onOk: (result: unknown) => void;
  onCancel: () => void;
}

const Table = (props: TableProps) => {
  const [value, setValue] = useState<string | null>(
    props.pseudo ? props.label ?? null : null,
  );

  const selected = (label: string): boolean => value === label;

  const result = (): GenericElement | null => {
    if (!value?.length) {
      return null;
    }
    return { type: 'gen', label: value, pseudo: value };
  };

  const onAtomSelect = (label: string, activateImmediately = false): void => {
    setValue(label);

    if (activateImmediately) {
      props.onOk(result());
    }
  };

  return (
    <Dialog
      title="Extended Table"
      withDivider
      className={classes.extendedTable}
      params={props}
      result={result}
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Add' }}
      needMargin={false}
    >
      <GenericGroups
        selected={selected}
        onAtomSelect={onAtomSelect}
        disabledQueryElements={props.disabledQueryElements ?? null}
      ></GenericGroups>
    </Dialog>
  );
};

interface State {
  editor: Editor;
}

interface OwnProps {
  isNestedModal?: boolean;
  onOk: (result: unknown) => void;
}

interface StateProps {
  disabledQueryElements: Array<string> | null | undefined;
  pseudo?: string;
  label?: string;
}

interface DispatchProps {
  onOk: (result: unknown) => void;
}

function mapSelectionToProps(editor: Editor): Partial<StateProps> {
  const selection = editor.selection();
  if (selection?.atoms?.length === 1) {
    const struct = editor.struct();
    const atom = struct.atoms.get(selection.atoms[0]);
    return { ...fromElement(atom) };
  }

  return {};
}

const mapStateToProps = (state: State): StateProps => {
  const editor = state.editor;
  const disabledQueryElements = editor.render.options.disableQueryElements;
  return { disabledQueryElements, ...mapSelectionToProps(editor) };
};

const mapDispatchToProps = (
  dispatch: Dispatch,
  ownProps: OwnProps,
): DispatchProps => {
  return {
    onOk: (result: unknown) => {
      if (!ownProps.isNestedModal) {
        dispatch(onAction({ tool: 'atom', opts: toElement(result) }));
      }
      ownProps.onOk(result);
    },
  };
};

const ExtendedTable = connect(mapStateToProps, mapDispatchToProps)(Table);

export default ExtendedTable;
