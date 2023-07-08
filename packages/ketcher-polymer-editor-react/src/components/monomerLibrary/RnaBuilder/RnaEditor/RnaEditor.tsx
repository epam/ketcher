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

import { ChangeEvent, useState } from 'react';
import { RnaEditorCollapsed } from './RnaEditorCollapsed';
import { RnaEditorExpanded } from './RnaEditorExpanded';
import { ExpandButton, ExpandIcon, RnaEditorContainer } from './styles';

export const RnaEditor = () => {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState('My Rna');

  const expandEditor = () => {
    setExpanded(!expanded);
  };

  const changeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  return (
    <RnaEditorContainer>
      {expanded ? (
        <RnaEditorExpanded
          name={name}
          onChangeName={changeName}
          onCancel={expandEditor}
        />
      ) : (
        <RnaEditorCollapsed
          name={name}
          fullName="ALtrina2(m2nen)c7io7n2A"
          onEdit={expandEditor}
        />
      )}

      <ExpandButton onClick={expandEditor}>
        <ExpandIcon expanded={expanded} name="chevron" />
      </ExpandButton>
    </RnaEditorContainer>
  );
};
