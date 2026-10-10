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
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../components';
import dialogClasses from '../../../../../../../components/Dialog/Dialog.module.less';
import styles from './EditMonomer.module.less';
import { useAppContext } from '../../../../../../../hooks';
import {
  Action,
  fromSgroupDeletion,
  ketcherProvider,
  type EditMonomerVariant,
} from 'ketcher-core';
import type Editor from 'src/script/editor';

interface EditMonomerDialogProps extends BaseProps {
  fgIds: number[];
  variant: EditMonomerVariant;
}

type Props = EditMonomerDialogProps & BaseCallProps;

const EditMonomer = (props: Props) => {
  const { t } = useTranslation(['common', 'dialogs']);
  const BODY_TEXT: Record<EditMonomerVariant, string> = {
    single: t('dialogs:toolbox.editMonomer.bodyTextSingle'),
    identical: t('dialogs:toolbox.editMonomer.bodyTextIdentical'),
    'non-identical': t('dialogs:toolbox.editMonomer.bodyTextNonIdentical'),
  };
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
    if (editor.openEditMonomerWizard(fgIds, editAllInstances)) {
      onOk(true);
    }
  };

  const footerContent = (
    <>
      {variant === 'single' && (
        <input
          type="button"
          value={t('dialogs:toolbox.editMonomer.editMonomer')}
          className={dialogClasses.cancel}
          onClick={() => handleEditMonomer(false)}
          data-testid="edit-monomer-button"
        />
      )}
      {variant === 'identical' && (
        <input
          type="button"
          value={t('dialogs:toolbox.editMonomer.editAllMonomers')}
          className={dialogClasses.cancel}
          onClick={() => handleEditMonomer(true)}
          data-testid="edit-all-monomers-button"
        />
      )}
      <input
        type="button"
        value={t('dialogs:toolbox.editMonomer.removeGrouping')}
        className={dialogClasses.cancel}
        onClick={handleRemoveGrouping}
        data-testid="remove-abbreviation-button"
      />
      <input
        type="button"
        value={t('common:button.cancel')}
        className={dialogClasses.ok}
        onClick={handleCancel}
        data-testid="Cancel"
      />
    </>
  );

  return (
    <Dialog
      title={t('dialogs:toolbox.editMonomer.dialogTitle')}
      className={
        variant === 'non-identical' ? styles.windowSmall : styles.window
      }
      buttons={[]}
      params={{
        onCancel: handleCancel,
      }}
      footerContent={footerContent}
      data-testid="edit-abbreviation-window"
    >
      {BODY_TEXT[variant]}
    </Dialog>
  );
};

export type { EditMonomerDialogProps };
export { EditMonomer };
