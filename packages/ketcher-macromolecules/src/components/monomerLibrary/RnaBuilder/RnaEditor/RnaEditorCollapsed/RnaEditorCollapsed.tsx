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

import { memo } from 'react';
import {
  MonomerName,
  RnaEditorCollapsedContainer,
  TextContainer,
} from './styles';
import { IRnaEditorCollapsedProps } from './types';

const RnaEditorCollapsed = ({ name, fullName }: IRnaEditorCollapsedProps) => {
  if (!name && !fullName) {
    return null;
  }

  return (
    <RnaEditorCollapsedContainer>
      <TextContainer>
        <MonomerName>{name ?? fullName}</MonomerName>
      </TextContainer>
    </RnaEditorCollapsedContainer>
  );
};

export default memo(RnaEditorCollapsed);
