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
import { MonomerItemType, MonomerOrAmbiguousType } from 'ketcher-core';

export const Card = styled.div<{
  code?: string;
  selected?: boolean;
  disabled?: boolean;
  isVariantMonomer?: boolean;
  item?: MonomerOrAmbiguousType;
}>`
  background: white;
  height: 48px;
  text-align: center;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? '0.4' : '1')};
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: ${({ theme }) => theme.ketcher.font.size.small};
  color: ${({ theme }) => theme.ketcher.color.text.primary};
  position: relative;
  overflow: hidden;
  border-radius: 4px;
  box-shadow: 0 2px 5px 0 rgba(103, 104, 132, 0.149);
  margin: 0;
  user-select: none;
  border-color: #167782;
  border-width: ${({ selected }) => (selected ? '2px 2px 2px' : '0px')};
  border-style: solid;
  box-sizing: border-box;
  z-index: ${({ selected }) => (selected ? 2 : undefined)};

  .hidden & .star {
    visibility: hidden !important;
  }

  &:hover {
    outline: 1px solid #b4b9d6;
    > .star {
      visibility: visible;
      opacity: 1;
    }
  }
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    border-bottom: ${({ isVariantMonomer }) =>
      isVariantMonomer ? '1px solid #CAD3DD' : 'none'};
    background: ${({ code, theme, item }) => {
      if (!item) return theme.ketcher.monomer.color.default?.regular;

      const monomerItem = item as MonomerItemType;
      const isPeptideTab = monomerItem.props?.MonomerType === 'PEPTIDE';
      if (
        isPeptideTab &&
        theme.ketcher.peptide.color[code as string]?.regular
      ) {
        return theme.ketcher.peptide.color[code as string]?.regular;
      }

      const monomerColor =
        theme.ketcher.monomer.color[code as string]?.regular ||
        theme.ketcher.monomer.color.default?.regular;
      return monomerColor;
    }};
  }
  ,
  > span {
    position: absolute;
    bottom: ${({ selected }) => (selected ? '4px' : '6px')};
    left: ${({ selected }) => (selected ? '4px' : '6px')};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 85%;
  }
  > .star {
    color: #e1e5ea;
    position: absolute;
    top: 12px;
    right: 3px;
    font-size: 15px;
    opacity: 0;
    transition: 0.2s ease;
    flex-shrink: 0;
    &.visible {
      visibility: visible;
      opacity: 1;
    }
    &:active {
      transform: scale(1.4);
    }
    &:hover,
    &.visible {
      color: #faa500;
    }
  }
`;

export const NumberCircle = styled.div<{
  selected?: boolean;
  monomersAmount: number;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 15px;
  width: ${({ monomersAmount }) => (monomersAmount >= 10 ? '20px' : '15px')};
  border-radius: ${({ monomersAmount }) =>
    monomersAmount >= 10 ? '20px' : '50%'};
  border: 1px solid #cceaee;
  position: absolute;
  bottom: ${({ selected }) => (selected ? '4px' : '6px')};
  left: ${({ selected }) => (selected ? '18px' : '20px')};
  font-size: 12px;
  line-height: 12px;
`;

export const CardTitle = styled.span`
  font-size: 12px;
`;
