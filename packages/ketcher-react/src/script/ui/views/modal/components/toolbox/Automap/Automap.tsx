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
import Form, { Field } from '../../../../../component/form/form/form';
import { useTranslation } from 'react-i18next';
import { Dialog } from '../../../../components';
import classes from './Automap.module.less';
import Select from '../../../../../component/form/Select/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import i18n from 'src/i18n/i18n';

type Props = BaseProps & BaseCallProps;

export const automapSchema = {
  title: i18n.t('dialogs:toolbox.automap.dialogTitle'),
  type: 'object',
  required: ['mode'],
  properties: {
    mode: {
      title: i18n.t('dialogs:toolbox.automap.modeLabel'),
      enum: ['discard', 'keep', 'alter', 'clear'],
      enumNames: [
        i18n.t('dialogs:toolbox.automap.discard'),
        i18n.t('dialogs:toolbox.automap.keep'),
        i18n.t('dialogs:toolbox.automap.alter'),
        i18n.t('dialogs:toolbox.automap.clear'),
      ],
      default: 'discard',
    },
  },
};

const Automap = (props: Props) => {
  const { t } = useTranslation(['common', 'dialogs']);
  const { formState, ...rest } = props;
  return (
    <Dialog
      title={t('dialogs:toolbox.automap.dialogTitle')}
      className={classes.automap}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}
      withDivider
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: t('common:button.apply') }}
    >
      <Form schema={automapSchema} {...formState}>
        <Field
          name="mode"
          options={getSelectOptionsFromSchema(automapSchema.properties.mode)}
          {...props}
          component={Select}
          data-testid="automap-mode"
        />
      </Form>
    </Dialog>
  );
};

export default Automap;
