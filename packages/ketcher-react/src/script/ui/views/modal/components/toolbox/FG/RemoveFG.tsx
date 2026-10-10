/* eslint-disable @typescript-eslint/no-explicit-any */
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
import classes from './RemoveFG.module.less';
import { useAppContext } from '../../../../../../../hooks';
import { fromSgroupDeletion, ketcherProvider } from 'ketcher-core';

interface RemoveFGProps extends BaseProps {
  fgIds: any;
}

type Props = RemoveFGProps & BaseCallProps;

const RemoveFG = (props: Props) => {
  const { t } = useTranslation(['common', 'dialogs']);
  const { ketcherId } = useAppContext();
  const editor = ketcherProvider.getKetcher(ketcherId).editor as any;
  const { fgIds } = props;

  const remove = function () {
    if (fgIds.length > 0)
      for (const id of fgIds) {
        editor.update(fromSgroupDeletion(editor.render.ctab, id));
      }
    return true;
  };

  const exit = (key, res) => {
    props[key](res);
  };

  return (
    <div
      onSubmit={(event) => event.preventDefault()}
      tabIndex={-1}
      className={classes.window}
      data-testid="edit-abbreviation-window"
    >
      <header className={classes.header}>
        {t('dialogs:toolbox.removeFG.header')}
      </header>
      <div className={classes.question}>
        {t('dialogs:toolbox.removeFG.question')}
      </div>
      <footer className={classes.footer}>
        <input
          type="button"
          value={t('common:button.cancel')}
          className={classes.buttonCancel}
          onClick={() => exit('onOk', false)}
          data-testid="Cancel"
        />
        <input
          type="button"
          value={t('dialogs:toolbox.removeFG.removeAbbreviation')}
          data-testid="remove-abbreviation-button"
          className={classes.buttonOk}
          onClick={() => exit('onOk', remove())}
        />
      </footer>
    </div>
  );
};

export type { RemoveFGProps };
export { RemoveFG };
