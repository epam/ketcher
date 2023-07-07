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

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: ${(props) => props.theme.ketcher.color.background.primary};
  border: ${(props) => props.theme.ketcher.border.regular};
  border-radius: ${(props) => props.theme.ketcher.border.radius.regular};
  box-shadow: ${(props) => props.theme.ketcher.shadow.regular};
`;

export const MonomerName = styled.p`
  color: ${(props) => props.theme.ketcher.color.text.primary};
  font-size: ${(props) => props.theme.ketcher.font.size.regular};
  word-break: break-all;
  text-align: center;
  margin: 0 0 5px 0;
`;

export const StyledStructRender = styled(StructRender)`
  height: 100%;
  width: 100%;
`;
