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

import Form, { Field } from '../../../component/form/form/form';

import ButtonList from '../../../component/form/buttonlist';
import { Dialog } from '../../../views/components';
import classes from './rgroup.module.less';
import { connect } from 'react-redux';
import { rgroupSchema } from '../../../data/schema/struct-schema';

interface RGroupResult {
  values: number[];
}

interface RGroupFormState {
  result: RGroupResult;
  valid: boolean;
  errors: Record<string, string>;
}

interface RGroupProps {
  disabledIds: number[];
  values: number[];
  formState: RGroupFormState;
  type: 'atom' | 'fragment';
}

interface RGroupCallProps {
  onCancel: () => void;
  onOk: (result: unknown) => void;
}

interface RGroupStoreState {
  modal: {
    form: RGroupFormState;
  };
}

type Props = RGroupProps & RGroupCallProps;

function RGroup({ disabledIds, values, formState, type, ...props }: Props) {
  return (
    <Dialog
      title="R-Group"
      className={classes.rgroup}
      params={props}
      result={() => formState.result}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={['Cancel', 'OK']}
      withDivider
    >
      <Form schema={rgroupSchema} init={{ values }} {...formState}>
        <Field
          name="values"
          multiple={type === 'atom'}
          labelPos={false}
          component={ButtonList}
          disabledIds={disabledIds}
          classes={classes}
          testId="rgroup-item"
        />
      </Form>
    </Dialog>
  );
}

export default connect((state: RGroupStoreState) => ({
  formState: state.modal.form,
}))(RGroup);
