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

export const HeaderContent = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const HeaderTitle = styled.span`
  padding-right: 4px;
`;

export const HeaderButton = styled.button`
  background-color: transparent;
  border: none;
  color: #167782;
  padding: 0;
  font-size: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #005662;
  }

  &:disabled {
    color: #cad3dd;
    cursor: not-allowed;
  }

  input[type='file'] {
    display: none;
  }
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
  justify-content: flex-start;
  font-size: 12px;
  line-height: 14px;
  margin-bottom: 12px;
  color: #333333;
  height: 24px;

  label {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
  }

  label > span:first-of-type {
    width: 168px;
    margin-right: 8px;
  }

  label > input,
  label > select,
  label > div {
    width: 120px;
    margin-right: auto;
  }
`;
