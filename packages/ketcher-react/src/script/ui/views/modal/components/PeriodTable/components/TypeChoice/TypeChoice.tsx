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

import classes from './TypeChoice.module.less';
import { GenericInput } from 'src/script/ui/component/form/Input/Input';
import type { PeriodTableType } from '../../types';
import { useTranslation } from 'react-i18next';

interface TypeSchemaItem {
  titleKey: string;
  value: PeriodTableType;
  testId: string;
}

const typeSchema: TypeSchemaItem[] = [
  {
    titleKey: 'periodTable.typeSingle',
    value: 'atom',
    testId: 'single-radio-button',
  },
  {
    titleKey: 'periodTable.typeList',
    value: 'list',
    testId: 'list-radio-button',
  },
  {
    titleKey: 'periodTable.typeNotList',
    value: 'not-list',
    testId: 'not-list-radio-button',
  },
];

interface TypeChoiceProps {
  value: PeriodTableType;
  onChange: (value: PeriodTableType) => void;
  disabled?: boolean;
}

function TypeChoice({ value, onChange, disabled }: Readonly<TypeChoiceProps>) {
  const { t } = useTranslation('dialogs');
  return (
    <fieldset className={classes.fieldset} disabled={disabled}>
      {typeSchema.map((type) => (
        <label key={type.titleKey}>
          <GenericInput
            type="radio"
            value={type.value}
            data-testid={type.testId}
            checked={type.value === value}
            onChange={() => onChange(type.value)}
            disabled={disabled}
            // Note: schema and innerRef are required by GenericInput's Props type
            // definition in Input.tsx, though they are optional in the implementation
            schema={undefined}
            innerRef={undefined}
          />
          {t(type.titleKey)}
        </label>
      ))}
    </fieldset>
  );
}

export default TypeChoice;
