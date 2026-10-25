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

import type { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Field } from '../../component/form/form/form';
import Select from '../../component/form/Select';
import { sgroupMap as schemes } from '../../data/schema/struct-schema';
import { getSelectOptionsFromSchema } from '../../utils';
import classes from './sgroup.module.less';
import type { BaseProperties } from '../../views/modal/modal.types';

type PropertyMappingValue = {
  maxLength?: number;
  type?: string;
};

enum SGroupPropertyType {
  Connectivity = 'connectivity',
  Class = 'class',
  Subtype = 'subtype',
}

const propertyMapping: Record<string, PropertyMappingValue> = {
  name: { maxLength: 15 },
  fieldName: { maxLength: 30 },
  fieldValue: { type: 'textarea' },
  radiobuttons: { type: 'radio' },
};

const content = (type: string, t: TFunction): JSX.Element[] =>
  Object.keys(schemes[type].properties)
    .filter((property) => property !== 'type')
    .map((property) => {
      if (
        property === SGroupPropertyType.Connectivity ||
        property === SGroupPropertyType.Class ||
        property === SGroupPropertyType.Subtype
      ) {
        return (
          <Field
            name={property}
            key={`${type}-${property}`}
            component={Select}
            options={getSelectOptionsFromSchema(
              schemes[type].properties[property],
              t,
            )}
            data-testid={property}
          />
        );
      }

      const properties = propertyMapping[property] || {};
      return (
        <Field name={property} key={`${type}-${property}`} {...properties} />
      );
    });

interface SGroupFieldsetProperties {
  formState: BaseProperties['formState'];
}

function SGroupFieldset({ formState }: Readonly<SGroupFieldsetProperties>) {
  const { result } = formState;
  const { t } = useTranslation();

  const type = result.type;

  return (
    <fieldset className={type === 'DAT' ? classes.data : 'base'}>
      {content(type, t)}
    </fieldset>
  );
}

export default SGroupFieldset;
