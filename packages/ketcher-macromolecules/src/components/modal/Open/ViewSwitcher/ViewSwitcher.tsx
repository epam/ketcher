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
import { AnalyzingFile, AnalyzingFileProperties } from '../AnalyzingFile';
import { OpenOptions, OpenOptionsProperties } from '../OpenOptions';
import { TextEditorProperties, TextArea } from '../../../shared/TextArea';
import styled from '@emotion/styled';

type ViewStates = {
  openOptions: string;
  textEditor: string;
};

type SwitchProperties = {
  currentState: string;
  states: ViewStates;
  isAnalyzingFile: boolean;
} & OpenOptionsProperties &
  TextEditorProperties &
  AnalyzingFileProperties;

const StyledTextField = styled(TextArea)`
  width: 100%;
  height: 320px;
`;

export const ViewSwitcher = (properties: SwitchProperties) => {
  if (properties.isAnalyzingFile) {
    return <AnalyzingFile fileName={properties.fileName} />;
  } else {
    switch (properties.currentState) {
      case properties.states.openOptions:
        return <OpenOptions {...properties} />;
      case properties.states.textEditor:
        return (
          <StyledTextField testId="open-structure-textarea" {...properties} />
        );
      default:
        return null;
    }
  }
};
