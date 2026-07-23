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
import { StructRender } from 'ketcher-react';

export const Container = styled.div<{ isLongName?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  overflow: hidden;
  width: ${(props) => (props.isLongName ? '450px' : '345px')};
  height: 345px;
  background: ${(props) => props.theme.ketcher.color.background.primary};
  border: ${(props) => props.theme.ketcher.border.regular};
  border-radius: ${(props) => props.theme.ketcher.border.radius.regular};
  box-shadow: ${(props) => props.theme.ketcher.shadow.regular};
`;

export const MonomerName = styled.p<{ isLongName?: boolean }>`
  width: calc(100% - 16px);
  padding: 8px;
  color: ${(props) => props.theme.ketcher.color.text.primary};
  background-color: #cceaee;
  font-size: ${(props) =>
    props.isLongName ? '8px' : props.theme.ketcher.font.size.regular};
  font-weight: 700;
  word-break: break-all;
  text-align: left;
  margin: 0;
  white-space: pre-wrap;
  ${(props) =>
    props.isLongName &&
    `
    max-height: 200px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 15;
    -webkit-box-orient: vertical;
  `}
`;

export const StyledStructRender = styled(StructRender)`
  flex: 1 1 auto;
  min-height: 80px;
  width: 100%;
  padding: 0 8px;
`;

export const InfoBlock = styled.div`
  width: 100%;
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 0 8px 4px;
`;
