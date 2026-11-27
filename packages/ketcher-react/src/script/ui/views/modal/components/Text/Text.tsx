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

import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LexicalEditor } from 'lexical';
import { LexicalComposer } from '@lexical/react/LexicalComposer';

import { Dialog } from '../../../components';
import type { DialogParams } from '../../../../../../components/Dialog/Dialog';
import classes from './Text.module.less';
import { connect } from 'react-redux';
import type { FormState } from 'src/script/ui/component/form/form/form';
import {
  normalizeEditorState,
  serializeTextEditor,
  TextEditorSurface,
  textEditorTheme,
} from './TextEditor';

export { normalizeEditorState };

interface TextFormState {
  form: FormState;
}

interface TextProps extends DialogParams {
  formState: TextFormState;
  id?: string;
  content: string;
  position?: string;
}

const TextEditorInner = (props: {
  formState: TextFormState;
  position?: string;
  id?: string;
  params: TextProps;
}) => {
  const { formState, position, id, params } = props;
  const { t } = useTranslation(['common', 'dialogs']);
  const editorRef = useRef<LexicalEditor | null>(null);

  const result = () => ({
    content: serializeTextEditor(editorRef.current),
    position,
    id,
  });

  return (
    <Dialog
      className={classes.textEditor}
      title={t('dialogs:text.dialogTitle')}
      params={params}
      result={result}
      valid={() => formState.form.valid}
      buttonsNameMap={{ OK: t('common:button.apply') }}
      buttons={['Cancel', 'OK']}
      withDivider
    >
      <TextEditorSurface
        labels={{
          toolbar: t('dialogs:text.toolbarAriaLabel'),
          fontSize: t('dialogs:text.fontSizeLabel'),
          text: t('dialogs:text.textLabel'),
        }}
        editorRef={editorRef}
      />
    </Dialog>
  );
};

const Text = (props: TextProps) => {
  const { formState, position, id } = props;

  const initialConfig = {
    namespace: 'KetcherTextEditor',
    onError: (error: Error) => {
      console.error('Lexical error:', error);
    },
    editorState: normalizeEditorState(props.content),
    theme: textEditorTheme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <TextEditorInner
        formState={formState}
        position={position}
        id={id}
        params={props}
      />
    </LexicalComposer>
  );
};

export default connect((store: { modal: TextFormState }) => ({
  formState: store.modal,
}))(Text);
