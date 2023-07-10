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
import { attachmentPoints as attachmentPointsSchema } from '../../../../../data/schema/struct-schema';
import classes from './Attach.module.less';

interface AttachPointsProps extends BaseProps {
  primary: boolean;
  secondary: boolean;
}

type Props = AttachPointsProps & BaseCallProps;

const AttachPoints = (props: Props) => {
  const { formState, ...rest } = props;
  return (
    <Dialog
      title="Attachment Points"
      className={classes.attachPoints}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}
      buttonsNameMap={{ OK: 'Apply' }}
      buttons={['Cancel', 'OK']}
      withDivider
    >
      <Form schema={attachmentPointsSchema} init={rest} {...formState}>
        <Field name="primary" />
        <Field name="secondary" />
      </Form>
    </Dialog>
  );
};

export type { AttachPointsProps };
export default AttachPoints;
