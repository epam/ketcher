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

import { Field } from '../../../../../../../component/form/form/form';
import type { RgroupLogicProperties } from '../../RgroupLogic';
import classes from './IfThenSelect.module.less';
import { useFormContext } from '../../../../../../../../../hooks';
import Select from '../../../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../../../utils';
import { useTranslation } from 'react-i18next';

type Properties = Pick<
  RgroupLogicProperties,
  'label' | 'rgroupLabels' | 'name'
>;

const IfThenSelect = (properties: Properties) => {
  const { t } = useTranslation('dialogs');
  const { rgroupLabels, label, name } = properties;
  const { schema } = useFormContext();
  const desc = {
    title: schema.properties?.[name ?? '']?.title,
    enum: [0],
    enumNames: [t('toolbox.rgroupLogic.always')],
  };

  rgroupLabels.forEach((rgroupLabel) => {
    if (label !== rgroupLabel) {
      desc.enum.push(rgroupLabel);
      desc.enumNames.push(
        t('toolbox.rgroupLogic.ifThenOption', {
          ifLabel: label,
          thenLabel: rgroupLabel,
        }),
      );
    }
  });

  return (
    <Field
      schema={desc}
      className={classes.field}
      {...properties}
      component={Select}
      options={getSelectOptionsFromSchema(desc, t)}
    />
  );
};

export default IfThenSelect;
