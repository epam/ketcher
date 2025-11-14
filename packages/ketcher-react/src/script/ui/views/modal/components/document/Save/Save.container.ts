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

import SaveDialog from './Save';
import { connect } from 'react-redux';
import { check } from '../../../../../state/server';
import { saveUserTmpl } from '../../../../../state/templates';
import { updateFormState } from '../../../../../state/modal/form';

const mapStateToProps = (state: any) => ({
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  options: state.options.getServerSettings(),
  formState: state.modal.form,
  moleculeErrors: state.modal.form.moleculeErrors,
  checkState: state.options.check,
  bondThickness: state.options.settings.bondThickness,
  ignoreChiralFlag: state.editor.render.options.ignoreChiralFlag,
  editor: state.editor,
});

const mapDispatchToProps = (dispatch: any) => ({
  onOk: (result: any) => result,
  onCheck: (checkOptions: any) => dispatch(check(checkOptions)),
  onTmplSave: (struct: any) => dispatch(saveUserTmpl(struct)),
  onResetForm: (prevState: any) => dispatch(updateFormState(prevState)),
});

const SaveContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SaveDialog as any);
export default SaveContainer;
