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

import type { BaseCallProperties, BaseProperties } from '../../../modal.types';

import Automap from './Automap';
import { automap } from '../../../../../state/server';
import type {
  AutomapRequest,
  StoreState,
} from '../../../../../state/store.types';
import type { AppDispatch } from '../../../../../state/hooks';
import { connect } from 'react-redux';

type StateProperties = Pick<BaseProperties<AutomapRequest>, 'formState'>;
type DispatchProperties = Pick<BaseCallProperties<AutomapRequest>, 'onOk'>;
type OwnProperties = Pick<BaseCallProperties, 'onOk'>;
type State = Pick<StoreState, 'modal'>;

const mapStateToProperties = (state: State): StateProperties => ({
  // The modal store keeps a generic form result for every dialog
  formState: state.modal.form as StateProperties['formState'],
});

const mapDispatchToProperties = (
  dispatch: AppDispatch,
  ownProperties: OwnProperties,
): DispatchProperties => ({
  onOk: (result: AutomapRequest) => {
    dispatch(automap(result));
    ownProperties.onOk(result);
  },
});

const AutomapContainer = connect(
  mapStateToProperties,
  mapDispatchToProperties,
)(Automap);
export default AutomapContainer;
