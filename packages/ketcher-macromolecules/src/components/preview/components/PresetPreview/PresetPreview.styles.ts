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
import { Icon } from 'ketcher-react';

export const PresetContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: ${(props) => props.theme.ketcher.color.background.primary};
  border: ${(props) => props.theme.ketcher.border.regular};
  border-radius: ${(props) => props.theme.ketcher.border.radius.regular};
  box-shadow: ${(props) => props.theme.ketcher.shadow.regular};
`;

export const PresetMonomerRow = styled.div`
  display: flex;
  align-items: center;
`;

export const PresetMonomerLabel = styled.div`
  font-size: ${(props) => props.theme.ketcher.font.size.regular};
  line-height: ${(props) => props.theme.ketcher.font.size.regular};
  font-weight: 600;
  padding-right: 2px;
`;

export const PresetMonomerName = styled.div`
  color: ${(props) => props.theme.ketcher.color.text.lightgrey};
  font-size: ${(props) => props.theme.ketcher.font.size.regular};
  font-weight: 400;
  white-space: nowrap;
`;

export const PresetName = styled.p`
  color: ${(props) => props.theme.ketcher.color.text.primary};
  font-size: ${(props) => props.theme.ketcher.font.size.regular};
  font-weight: 700;
  word-break: break-all;
  text-align: center;
  margin-top: 0;
  margin-bottom: 8px;
`;

export const PresetIcon = styled(Icon)`
  color: ${(props) => props.theme.ketcher.color.icon.grey};
  padding-right: ${(props) =>
    props.name === 'sugar' ? '4px' : props.name === 'phosphate' ? '1px' : 0};
  padding-left: ${(props) =>
    props.name === 'base' ? '2px' : props.name === 'phosphate' ? '1px' : 0};
  stroke: ${(props) => props.theme.ketcher.color.icon.grey};
  height: ${(props) => (props.name === 'sugar' ? '12px' : '14px')};
  width: ${(props) => (props.name === 'sugar' ? '12px' : '14px')};
`;
