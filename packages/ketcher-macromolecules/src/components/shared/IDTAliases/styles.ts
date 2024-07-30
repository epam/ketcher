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

export const IDTAliasesContainer = styled.span<{ preset?: boolean }>`
  max-width: ${({ preset }) => (preset ? '100%' : '50%')};
  font-size: ${(props) => props.theme.ketcher.font.size.regular};
  font-weight: 500;
  line-height: normal;
  color: ${(props) => props.theme.ketcher.color.text.lightgrey};
  padding-left: ${({ preset }) => (preset ? '0' : '8px')};
  border-left: ${({ preset }) => (preset ? 'none' : '1px solid #D9DCEA')};
`;

export const IDTTitle = styled.span`
  color: #7c7c7c;
`;

export const IDTAliasesList = styled.span`
  color: #585858;
  text-wrap: wrap;
`;
