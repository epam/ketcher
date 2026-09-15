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

import { useTranslation } from 'react-i18next';

interface CheckSchemaItem {
  type: string;
  enum: string[];
  enumNames: string[];
}

interface CheckSchemaProperties {
  checkOptions: {
    title: string;
    type: string;
    items: CheckSchemaItem;
  };
}

interface CheckSchema {
  title: string;
  type: string;
  properties: CheckSchemaProperties;
}

interface MoleculeErrors {
  [key: string]: string;
}

interface ErrorsCheckProps {
  moleculeErrors: MoleculeErrors;
  checkSchema: CheckSchema;
}

function ErrorsCheck(props: Readonly<ErrorsCheckProps>) {
  const { t } = useTranslation('dialogs');
  const { moleculeErrors, checkSchema } = props;
  const moleculeErrorsTypes = Object.keys(moleculeErrors);

  const getOptionName = (option: string): string => {
    const { items } = checkSchema.properties.checkOptions;
    const nameIndex = items.enum.indexOf(option);
    return items.enumNames[nameIndex];
  };

  return (
    <fieldset>
      {moleculeErrorsTypes.length === 0 ? (
        <div>
          <dd>{t('process.check.noErrorsDetected')}</dd>
        </div>
      ) : (
        moleculeErrorsTypes.map((type) => (
          <div key={type} data-testid={`${type}-warning`}>
            <dt>
              {t('process.check.warningSuffix', { name: getOptionName(type) })}
            </dt>
            <dd>{moleculeErrors[type]}</dd>
          </div>
        ))
      )}
    </fieldset>
  );
}

export default ErrorsCheck;
