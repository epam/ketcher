/****************************************************************************
 * Copyright 2022 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type ElementFormData,
  fromElement,
  toElement,
} from '../../../../data/convert/structconv';

import { Dialog } from '../../../components';
import GenericGroups from './components/GenericGroups';
import classes from './ExtendedTable.module.less';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import type { Editor } from 'ketcher-core';
import { onAction } from '../../../../state';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface GenericElement {
  type: 'gen';
  label: string;
  pseudo: string;
}

interface TableProperties {
  pseudo?: string;
  label?: string;
  disabledQueryElements: Array<string> | null | undefined;
  onOk: (result: unknown) => void;
  onCancel: () => void;
}

const Table = (properties: TableProperties) => {
  const { t } = useTranslation(['common', 'dialogs']);
  const [value, setValue] = useState<string | null>(
    properties.pseudo ? (properties.label ?? null) : null,
  );

  const isSelected = (label: string): boolean => value === label;

  const result = (): GenericElement | null => {
    if (!value?.length) {
      return null;
    }
    return { type: 'gen', label: value, pseudo: value };
  };

  const onAtomSelect = (label: string): void => {
    setValue(label);
  };

  const onAtomActivate = (label: string): void => {
    setValue(label);
    properties.onOk(result());
  };

  return (
    <Dialog
      title={t('dialogs:extendedTable.dialogTitle')}
      withDivider
      className={classes.extendedTable}
      params={properties}
      result={result}
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: t('dialogs:shared.addButton') }}
      needMargin={false}
    >
      <GenericGroups
        selected={isSelected}
        onAtomSelect={onAtomSelect}
        onAtomActivate={onAtomActivate}
        disabledQueryElements={properties.disabledQueryElements ?? null}
      ></GenericGroups>
    </Dialog>
  );
};

interface State {
  editor: Editor;
}

interface OwnProperties {
  isNestedModal?: boolean;
  onOk: (result: unknown) => void;
}

interface StateProperties {
  disabledQueryElements: Array<string> | null | undefined;
  pseudo?: string;
  label?: string;
}

interface DispatchProperties {
  onOk: (result: unknown) => void;
}

function mapSelectionToProperties(editor: Editor): Partial<StateProperties> {
  const selection = editor.selection();
  if (selection?.atoms?.length === 1) {
    const struct = editor.struct();
    const atom = struct.atoms.get(selection.atoms[0]);
    if (!atom) return {};
    return { ...fromElement(atom) } as Partial<StateProperties>;
  }

  return {};
}

const mapStateToProperties = (state: State): StateProperties => {
  const editor = state.editor;
  const disabledQueryElements = editor.render.options.disableQueryElements;
  return { disabledQueryElements, ...mapSelectionToProperties(editor) };
};

const mapDispatchToProperties = (
  dispatch: Dispatch,
  ownProperties: OwnProperties,
): DispatchProperties => {
  return {
    onOk: (result: unknown) => {
      if (!ownProperties.isNestedModal) {
        dispatch(
          onAction({
            tool: 'atom',
            opts: toElement(result as ElementFormData),
          }),
        );
      }
      ownProperties.onOk(result);
    },
  };
};

const ExtendedTable = connect(
  mapStateToProperties,
  mapDispatchToProperties,
)(Table);

export default ExtendedTable;
