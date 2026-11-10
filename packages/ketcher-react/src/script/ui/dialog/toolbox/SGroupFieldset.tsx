/****************************************************************************
 * Copyright 2021 EPAM Systems
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

import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Field } from '../../component/form/form/form';
import Select from '../../component/form/Select';
import {
  sgroupMap as schemes,
  type SchemaProperty,
} from '../../data/schema/struct-schema';
import { getSelectOptionsFromSchema } from '../../utils';
import classes from './sgroup.module.less';
import type { BaseProps } from '../../views/modal/modal.types';

type PropMappingValue = {
  maxLength?: number;
  type?: string;
};

enum SGroupPropType {
  Connectivity = 'connectivity',
  Class = 'class',
  Subtype = 'subtype',
  BracketType = 'bracketType',
}

const propMapping: Record<string, PropMappingValue> = {
  name: { maxLength: 15 },
  fieldName: { maxLength: 30 },
  fieldValue: { type: 'textarea' },
  radiobuttons: { type: 'radio' },
};

const content = (
  type: string,
  t: TFunction,
  result: Record<string, unknown>,
): JSX.Element[] =>
  Object.keys(schemes[type].properties)
    .filter((prop) => prop !== 'type')
    .map((prop) => {
      if (prop === SGroupPropType.BracketType) {
        const selected =
          result[prop] === undefined
            ? (schemes[type].properties[prop] as SchemaProperty).default
            : result[prop];
        return (
          <Field
            name={prop}
            key={`${type}-${prop}`}
            type="radio"
            checked={typeof selected === 'string' ? selected : undefined}
            groupAriaLabel={t(
              'dialogs:toolbox.structSchema.sgroup.bracketType.title',
            )}
            optionAriaLabels={{
              square: t(
                'dialogs:toolbox.structSchema.sgroup.bracketType.square',
              ),
              round: t('dialogs:toolbox.structSchema.sgroup.bracketType.round'),
              curly: t('dialogs:toolbox.structSchema.sgroup.bracketType.curly'),
            }}
            className={classes.bracketType}
          />
        );
      }

      if (
        prop === SGroupPropType.Connectivity ||
        prop === SGroupPropType.Class ||
        prop === SGroupPropType.Subtype
      ) {
        return (
          <Field
            name={prop}
            key={`${type}-${prop}`}
            component={Select}
            options={getSelectOptionsFromSchema(
              schemes[type].properties[prop],
              t,
            )}
            data-testid={prop}
          />
        );
      }

      const props = propMapping[prop] || {};
      return <Field name={prop} key={`${type}-${prop}`} {...props} />;
    });

interface SGroupFieldsetProps {
  formState: BaseProps<{ type: string; bracketType?: string }>['formState'];
}

function SGroupFieldset({ formState }: Readonly<SGroupFieldsetProps>) {
  const { result } = formState;
  const { t } = useTranslation();

  const type = result.type;

  return (
    <fieldset className={type === 'DAT' ? classes.data : 'base'}>
      {content(type, t, result)}
    </fieldset>
  );
}

export default SGroupFieldset;
