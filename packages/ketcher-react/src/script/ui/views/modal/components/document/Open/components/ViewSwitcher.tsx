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

import type { FC } from 'react';
import { type AnalyzingFileProperties, AnalyzingFile } from './AnalyzingFile';

import { type OpenOptionsProperties, OpenOptions } from './OpenOptions';
import { type TextEditorProperties, TextEditor } from './TextEditor';
import CDXStructuresViewer from './CDXStructuresViewer';
import type { CDXStructuresViewerProperties } from './CDXStructuresViewer/CDXStructuresViewer';

type ViewStates = {
  idle: string;
  textEditor: string;
  imageRec: string;
  presentationViewer: string;
};

type SwitchProperties = {
  currentState: string;
  states: ViewStates;
  isAnalyzingFile: boolean;
} & OpenOptionsProperties &
  TextEditorProperties &
  AnalyzingFileProperties &
  CDXStructuresViewerProperties;

export const ViewSwitcher: FC<SwitchProperties> = (
  properties: SwitchProperties,
) => {
  if (properties.isAnalyzingFile) {
    return <AnalyzingFile fileName={properties.fileName} />;
  } else {
    switch (properties.currentState) {
      case properties.states.idle:
        return <OpenOptions {...properties} />;
      case properties.states.textEditor:
        return <TextEditor {...properties} testId="open-structure-textarea" />;
      case properties.states.presentationViewer:
        return <CDXStructuresViewer {...properties} />;
      default:
        return null;
    }
  }
};
