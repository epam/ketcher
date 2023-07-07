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

import Form, { SelectOneOf } from '../../component/form/form/form';
import { connect } from 'react-redux';
import { sgroupMap as schemes } from '../../data/schema/struct-schema';
import { Dialog } from '../../views/components';
import SDataFieldset from './SDataFieldset';
import classes from './sgroup.module.less';
import SGroupFieldset from './SGroupFieldset';
import { useMemo } from 'react';

function Sgroup({ formState, ...props }) {
  const { result, valid } = formState;

  const type = result.type;

  const serialize = useMemo(
    () =>
      type === 'DAT' && result.context && result.fieldName && result.fieldValue
        ? {
            context: result.context.trim(),
            fieldName: result.fieldName.trim(),
            fieldValue:
              typeof result.fieldValue === 'string'
                ? result.fieldValue.trim()
                : result.fieldValue,
          }
        : {},
    [result.context, result.fieldName, result.fieldValue, type],
  );

  return (
    <Dialog
      title="S-Group Properties"
      className={classes.sgroup}
      result={() => result}
      valid={() => valid}
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Apply' }}
      withDivider={true}
      params={props}
    >
      <Form
        serialize={serialize}
        schema={schemes[type]}
        init={props}
        {...formState}
      >
        <SelectOneOf title="Type" name="type" schema={schemes} />

        {type === 'DAT' ? (
          <SDataFieldset formState={formState} />
        ) : (
          <SGroupFieldset formState={formState} />
        )}
      </Form>
    </Dialog>
  );
}

export default connect((store) => ({ formState: store.modal.form }))(Sgroup);
