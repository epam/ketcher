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

import { connect } from 'react-redux';
import type { DialogParams } from '../../../../../../components/Dialog/Dialog';
import type { FormState } from 'src/script/ui/component/form/form/form';
import { TextEditorDialog } from './TextEditorDialog';

export { normalizeEditorState } from './TextEditorDialog';

interface TextFormState {
  form: FormState;
}

interface TextProps extends DialogParams {
  formState: TextFormState;
  id?: string;
  content: string;
  position?: string;
}

const Text = ({
  formState,
  content,
  position,
  id,
  className,
  onOk,
  onCancel,
}: TextProps) => (
  <TextEditorDialog
    initialContent={content}
    className={className}
    isValid={() => formState.form.valid}
    onApply={(nextContent) => onOk?.({ content: nextContent, position, id })}
    onCancel={() => onCancel?.()}
  />
);

export default connect((store: { modal: TextFormState }) => ({
  formState: store.modal,
}))(Text);
