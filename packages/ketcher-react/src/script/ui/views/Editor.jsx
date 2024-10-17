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

import { StructEditor } from './components';
import { connect } from 'react-redux';
import initEditor from '../state/editor';
import { onAction } from '../state';
import action from '../action';

const dispatchAction = (dispatch, actionName, event) => {
  dispatch(onAction(action[actionName].action(event)));
};

const mapDispatchToProps = (dispatch) => {
  const onZoomIn = (event) => dispatchAction(dispatch, 'zoom-in', event);
  const onZoomOut = (event) => dispatchAction(dispatch, 'zoom-out', event);

  return {
    ...dispatch(initEditor),
    onZoomOut,
    onZoomIn,
  };
};

const Editor = connect((state) => {
  const serverSettings = state.options.getServerSettings();

  return {
    options: state.options.settings,
    serverSettings,
    indigoVerification: state.requestsStatuses.indigoVerification,
  };
}, mapDispatchToProps)(StructEditor);

export default Editor;
