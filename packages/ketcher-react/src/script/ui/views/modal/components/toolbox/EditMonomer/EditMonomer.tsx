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
import { Dialog } from '../../../../components';
import dialogClasses from '../../../../../../../components/Dialog/Dialog.module.less';
import styles from './EditMonomer.module.less';
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
  isSameMonomerType,
} from '../../../../components/MonomerCreationWizard/MonomerCreationWizard.utils';

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
    '"Remove Grouping" will turn the monomers into purely chemical structures. How do you wish to proceed?',
};

const EditMonomer = (props: Props) => {
  const { ketcherId } = useAppContext();
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
  const { fgIds, variant, onOk } = props;

  const handleCancel = () => {
    onOk(false);
  };

  const handleRemoveGrouping = () => {
    const ctab = editor.render.ctab;
    const action = new Action();
    for (const id of fgIds) {
      action.mergeWith(fromSgroupDeletion(ctab, id));
    }
    editor.update(action);
    onOk(true);
  };

  const handleEditMonomer = (editAllInstances = false) => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const struct = editor.struct();
    const firstSgroup = struct.sgroups.get(fgIds[0]);

    if (!(firstSgroup instanceof MonomerMicromolecule)) {
      return;
    }

    const atoms = [...firstSgroup.atoms];
    const bonds: number[] = [];
    struct.bonds.forEach((bond: Bond, bondId: number) => {
      if (atoms.includes(bond.begin) && atoms.includes(bond.end)) {
        bonds.push(bondId);
      }
    });

    let editAllInitialValues = getEditAllInstancesInitialValues(
      firstSgroup.monomer,
      provideEditorInstance()?.monomersLibraryParsedJson,
    );

    if (editAllInstances && fgIds.length > 1) {
      const selectedSGroupIds = fgIds.filter((id) => {
        const sg = struct.sgroups.get(id);
        return (
          sg instanceof MonomerMicromolecule &&
          isSameMonomerType(sg, firstSgroup.monomer)
        );
      });
      if (selectedSGroupIds.length > 1) {
        editAllInitialValues = { ...editAllInitialValues, selectedSGroupIds };
      }
    }

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
        ? editAllInitialValues
        : getEditInstanceInitialValues(firstSgroup.monomer),
      firstSgroup.getAttachmentPoints(),
    );

    onOk(true);
  };

  const footerContent = (
    <>
      {variant === 'single' && (
        <input
          type="button"
          value="Edit Monomer"
          className={dialogClasses.cancel}
          onClick={() => handleEditMonomer(false)}
          data-testid="Edit Monomer-button"
        />
      )}
      {variant === 'identical' && (
        <input
          type="button"
          value="Edit All Monomers"
          className={dialogClasses.cancel}
          onClick={() => handleEditMonomer(true)}
          data-testid="Edit All Monomers-button"
        />
      )}
      <input
        type="button"
        value="Remove Grouping"
        className={dialogClasses.cancel}
        onClick={handleRemoveGrouping}
        data-testid="Remove Grouping-button"
      />
      <input
        type="button"
        value="Cancel"
        className={dialogClasses.ok}
        onClick={handleCancel}
        data-testid="Cancel"
      />
    </>
  );

  return (
    <Dialog
      title="Edit Monomer"
      className={
        variant === 'non-identical' ? styles.windowSmall : styles.window
      }
      buttons={[]}
      params={{
        onCancel: handleCancel,
      }}
      footerContent={footerContent}
      data-testid="edit-monomer-window"
    >
      {BODY_TEXT[variant]}
    </Dialog>
  );
};

export type { EditMonomerDialogProps };
export { EditMonomer };
