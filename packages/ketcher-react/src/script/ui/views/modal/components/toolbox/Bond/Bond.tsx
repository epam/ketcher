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
import Form, { Field } from '../../../../../component/form/form/form';

import { Dialog } from '../../../../components';
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { bond as bondSchema } from '../../../../../data/schema/struct-schema';
import classes from './Bond.module.less';

interface BondProps extends BaseProps {
  center: number;
  topology: number;
  type: string;
}

type Props = BondProps & BaseCallProps;

const Bond = (props: Props) => {
  const { formState, ...rest } = props;
  const bondProps = bondSchema.properties;
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
      <Form schema={bondSchema} init={rest} {...formState}>
        <Field
          name="type"
          component={Select}
          options={getSelectOptionsFromSchema(bondProps.type)}
        />
        <Field
          name="topology"
          component={Select}
          options={getSelectOptionsFromSchema(bondProps.topology)}
        />
        <Field
          name="center"
          component={Select}
          options={getSelectOptionsFromSchema(bondProps.center)}
        />
      </Form>
    </Dialog>
  );
};

export type { BondProps };
export default Bond;
