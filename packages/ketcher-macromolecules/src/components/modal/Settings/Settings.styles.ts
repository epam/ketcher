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

export const Container = styled.div`
  padding: 16px;
  max-height: 600px;
  overflow-y: auto;
`;

export const FooterLeft = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

export const FooterRight = styled.div`
  display: flex;
  gap: 8px;
  margin-left: auto;
`;

export const FieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
`;

export const FieldWrapper = styled.div`
  display: flex;
  align-items: center;
`;
