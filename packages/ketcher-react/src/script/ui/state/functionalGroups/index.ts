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

import { AnyAction } from 'redux';
import { appUpdate } from '../options';
import {
  FunctionalGroupsProvider,
  SdfItem,
  SdfSerializer,
  Struct,
} from 'ketcher-core';
import templatesRawData from '../../../../templates/fg.sdf';
import { memoizedDebounce } from '../../utils';
import { TOOLTIP_DELAY } from '../../../editor/utils/functionalGroupsTooltip';
import { MODES } from 'src/constants';

interface FGState {
  lib: [];
  functionalGroupInfo: any;
  mode: string;
}

const initialState: FGState = {
  lib: [],
  functionalGroupInfo: null,
  mode: MODES.FG,
};

const functionalGroupsReducer = (
  state = initialState,
  { type, payload }: AnyAction
) => {
  switch (type) {
    case 'FG_INIT':
      return { ...state, ...payload };

    case 'FG_HIGHLIGHT':
      return { ...state, functionalGroupInfo: payload };

    default:
      return state;
  }
};

const initFGroups = (lib: SdfItem[]) => ({ type: 'FG_INIT', payload: { lib } });
const highlightFGroup = (group: any) => ({
  type: 'FG_HIGHLIGHT',
  payload: group,
});

function notDebouncedHighlightFG(dispatch, group: any) {
  dispatch(highlightFGroup(group));
}

export const highlightFG = memoizedDebounce(
  notDebouncedHighlightFG,
  TOOLTIP_DELAY / 3,
  [0]
);

export function initFGTemplates() {
  return async (dispatch) => {
    const provider = FunctionalGroupsProvider.getInstance();
    const sdfSerializer = new SdfSerializer();
    const templates = sdfSerializer.deserialize(templatesRawData);
    const functionalGroups = templates.reduce(
      (acc: Struct[], { struct }) => [...acc, struct],
      []
    );
    provider.setFunctionalGroupsList(functionalGroups);
    dispatch(initFGroups(templates));
    dispatch(appUpdate({ functionalGroups: true }));
  };
}

export default functionalGroupsReducer;
