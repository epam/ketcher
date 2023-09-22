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

import { BaseCallProps, BaseProps } from '../../../modal.types';
import Form, {
  CustomQueryField,
  Field,
} from '../../../../../component/form/form/form';

import { Dialog } from '../../../../components';
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { bond as bondSchema } from '../../../../../data/schema/struct-schema';
import classes from './Bond.module.less';
import { useMemo, useRef, useState } from 'react';

interface BondSettings {
  type: string;
  topology: number | null;
  center: number | null;
  customQuery: string;
}
interface BondProps extends BaseProps, BondSettings {}

type Props = BondProps & BaseCallProps;

const Bond = (props: Props) => {
  const { formState, ...rest } = props;
  const bondProps = bondSchema.properties;
  const [isCustomQuery, setIsCustomQuery] = useState(Boolean(rest.customQuery));
  const previousSettings = useRef<BondSettings>({
    type: 'single',
    topology: 0,
    center: 0,
    customQuery: '',
  });
  const customValid = useMemo(
    () => ({
      customQuery: (customQuery: string) =>
        customQueryValid(customQuery, isCustomQuery),
    }),
    [isCustomQuery],
  );
  const handleCustomQueryCheckBoxChange = (
    value: boolean,
    formState: BondSettings,
    _,
    updateFormState: (settings: BondSettings) => void,
  ) => {
    setIsCustomQuery(value);
    if (value) {
      const { type, topology, center, customQuery } = formState;
      previousSettings.current = {
        type,
        topology,
        center,
        customQuery,
      };
    }
    updateFormState(
      value
        ? {
            type: '',
            topology: null,
            center: null,
            customQuery: getBondCustomQuery(formState),
          }
        : previousSettings.current,
    );
  };

  return (
    <Dialog
      title="Bond Properties"
      className={classes.bond}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={['Cancel', 'OK']}
      withDivider
    >
      <Form
        schema={bondSchema}
        init={rest}
        {...formState}
        customValid={customValid}
      >
        <Field
          name="type"
          component={Select}
          options={getSelectOptionsFromSchema(bondProps.type)}
          disabled={isCustomQuery}
          formName="bond-properties"
        />
        <Field
          name="topology"
          component={Select}
          options={getSelectOptionsFromSchema(bondProps.topology)}
          disabled={isCustomQuery}
          formName="bond-properties"
        />
        <Field
          name="center"
          component={Select}
          options={getSelectOptionsFromSchema(bondProps.center)}
          disabled={isCustomQuery}
          formName="bond-properties"
        />
        <div className={classes.customQueryWrapper}>
          <CustomQueryField
            name="customQuery"
            labelPos="after"
            className={classes.checkbox}
            disabled={!isCustomQuery}
            checkboxValue={isCustomQuery}
            onCheckboxChange={handleCustomQueryCheckBoxChange}
          />
        </div>
      </Form>
    </Dialog>
  );
};

function customQueryValid(customQuery: string, isCustomQuery: boolean) {
  if (!isCustomQuery) {
    return true;
  }
  const regex = new RegExp(bondSchema.properties.customQuery.pattern);
  const isValid = regex.test(customQuery);
  return isValid;
}

function getBondCustomQuery(bond: BondSettings) {
  let queryAttrsText = '';
  const { type, topology } = bond;
  const bondType = {
    single: '-',
    double: '=',
    triple: '#',
    aromatic: ':',
    any: '~',
    up: '/',
    down: '\\',
  };
  if (type in bondType) {
    queryAttrsText += bondType[type];
  }
  if (queryAttrsText) {
    queryAttrsText += ';';
  }
  if (topology === 1) {
    queryAttrsText += '@';
  }
  return queryAttrsText;
}
export type { BondProps };
export default Bond;
