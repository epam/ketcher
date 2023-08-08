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

import Open, { OpenProps } from './Open';

import { BaseCallProps } from '../../../modal.types';
import { connect } from 'react-redux';
import { exec } from '../../../../../component/cliparea/cliparea';
import { load } from '../../../../../state';
import { changeImage } from '../../../../../state/options';

type StateProps = OpenProps;

type DispatchProps = {
  onOk: BaseCallProps['onOk'];
  onImageUpload: (file: File) => void;
};

const mapStateToProps = (state): StateProps => ({
  server: state.server,
  errorHandler: state.editor.errorHandler,
  isRecognizeDisabled: state.actionState.recognize?.disabled,
  isAnalyzingFile: state.requestsStatuses.isAnalyzingFile,
  ignoreChiralFlag: state.editor.render.options.ignoreChiralFlag,
});

const mapDispatchToProps = (dispatch): DispatchProps => ({
  onOk: (result) => {
    if (result.fragment) exec('copy');
    console.log('Open.container.ts::mapDispatchToProps::result', result);
    dispatch(
      load(result.structStr, {
        badHeaderRecover: true,
        fragment: result.fragment,
      }),
      // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
      // See PR #731 (https://github.com/epam/ketcher/pull/731)
    );
  },
  onImageUpload: (file) => {
    dispatch(changeImage(file));
  },
});

const OpenContainer = connect(mapStateToProps, mapDispatchToProps)(Open);
export default OpenContainer;
