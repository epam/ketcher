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

import type { BaseCallProps, BaseProps } from '../../../modal.types';
import classes from './EditMonomer.module.less';
import { useAppContext } from '../../../../../../../hooks';
import {
  Action,
  fromSgroupDeletion,
  ketcherProvider,
  MonomerMicromolecule,
  provideEditorInstance,
} from 'ketcher-core';
import type { EditMonomerVariant, Bond } from 'ketcher-core';
import type Editor from 'src/script/editor';
import {
  getEditAllInstancesInitialValues,
  getEditInstanceInitialValues,
} from '../../../../components/MonomerCreationWizard/MonomerCreationWizard.utils';
import clsx from 'clsx';

interface EditMonomerDialogProps extends BaseProps {
  fgIds: number[];
  variant: EditMonomerVariant;
}

type Props = EditMonomerDialogProps & BaseCallProps;

const BODY_TEXT: Record<EditMonomerVariant, string> = {
  single:
    '"Edit Monomer" will open the Monomer Creation Wizard and allow editing of this instance of the monomer. "Remove Grouping" will turn the monomer into a purely chemical structure. How do you wish to proceed?',
  identical:
    '"Edit All Monomers" will open the Monomer Creation Wizard and allow editing of all selected instances of the monomer. "Remove Grouping" will turn the monomers into a purely chemical structure. How do you wish to proceed?',
  'non-identical':
    '"Remove Grouping" will turn the monomers into a purely chemical structures. Do you want to proceed?',
};

const EditMonomer = (props: Props) => {
  const { ketcherId } = useAppContext();
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
  const { fgIds, variant } = props;

  const handleCancel = () => {
    props.onOk(false);
  };

  const handleRemoveGrouping = () => {
    const ctab = editor.render.ctab;
    const action = new Action();
    for (const id of fgIds) {
      action.mergeWith(fromSgroupDeletion(ctab, id));
    }
    editor.update(action);
    props.onOk(true);
  };

  const handleEditMonomer = (editAllInstances = false) => {
    const struct = editor.struct();
    const sg = struct.sgroups.get(fgIds[0]);

    if (!(sg instanceof MonomerMicromolecule)) {
      props.onOk(false);
      return;
    }

    // Collect all atoms/bonds that belong to the selected monomers
    const atomSet = new Set<number>();
    for (const id of fgIds) {
      const s = struct.sgroups.get(id);
      if (s instanceof MonomerMicromolecule) {
        s.atoms.forEach((a) => atomSet.add(a));
      }
    }
    const atoms = [...atomSet];
    const bonds: number[] = [];
    struct.bonds.forEach((bond: Bond, bondId: number) => {
      if (atomSet.has(bond.begin) && atomSet.has(bond.end)) {
        bonds.push(bondId);
      }
    });

    editor.openMonomerCreationWizard(
      {
        atoms,
        bonds,
        rxnArrows: [],
        rxnPluses: [],
        texts: [],
        rgroupAttachmentPoints: [],
      },
      editAllInstances
        ? getEditAllInstancesInitialValues(
            sg.monomer,
            provideEditorInstance()?.monomersLibraryParsedJson,
          )
        : getEditInstanceInitialValues(sg.monomer),
      sg.getAttachmentPoints(),
    );

    props.onOk(true);
  };

  return (
    <div
      onSubmit={(event) => event.preventDefault()}
      tabIndex={-1}
      className={clsx(
        classes.window,
        variant === 'non-identical' && classes.windowSmall,
      )}
      data-testid="edit-monomer-window"
    >
      <header className={classes.header}>Edit Monomer</header>
      <div className={classes.question}>{BODY_TEXT[variant]}</div>
      <footer className={classes.footer}>
        <input
          type="button"
          value="Cancel"
          className={classes.buttonCancel}
          onClick={handleCancel}
          data-testid="Cancel"
        />
        <input
          type="button"
          value="Remove Grouping"
          className={classes.buttonSecondary}
          onClick={handleRemoveGrouping}
          data-testid="Remove Grouping-button"
        />
        {variant === 'single' && (
          <input
            type="button"
            value="Edit Monomer"
            className={classes.buttonOk}
            onClick={() => handleEditMonomer(false)}
            data-testid="Edit Monomer-button"
          />
        )}
        {variant === 'identical' && (
          <input
            type="button"
            value="Edit All Monomers"
            className={classes.buttonOk}
            onClick={() => handleEditMonomer(true)}
            data-testid="Edit All Monomers-button"
          />
        )}
      </footer>
    </div>
  );
};

export type { EditMonomerDialogProps };
export { EditMonomer };
