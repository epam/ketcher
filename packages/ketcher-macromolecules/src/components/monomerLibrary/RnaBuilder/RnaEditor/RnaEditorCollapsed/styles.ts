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

import styled from '@emotion/styled';

export const RnaEditorCollapsedContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: #f7f9fa;
  border-radius: 0 0 4px 4px;
`;

export const MonomerName = styled.span`
  font-size: ${(props) => props.theme.ketcher.font.size.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => props.theme.ketcher.color.text.primary};
`;

export const TextContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;
