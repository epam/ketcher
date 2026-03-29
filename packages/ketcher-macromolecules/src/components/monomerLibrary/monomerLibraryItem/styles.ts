/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/
import styled from '@emotion/styled';
import { MonomerItemType, MonomerOrAmbiguousType } from 'ketcher-core';
import { Icon } from 'ketcher-react';

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
  cursor: ${({ disabled }) => (disabled ? 'default' : 'grab')};
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
    > .star,
    .autochain,
    .menu {
      visibility: visible;
      opacity: 1;
    }
  }

  .is-library-dragging &:not([data-dragging='true']) {
    cursor: grabbing !important;
  }

  .is-library-dragging &:not([data-dragging='true']):hover {
    outline: none;
  }

  .is-library-dragging &[data-dragging='true'] > .star,
  .is-library-dragging &[data-dragging='true'] .autochain,
  .is-library-dragging &[data-dragging='true'] .menu,
  .is-library-dragging &[data-dragging='true'] .dots {
    visibility: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .is-library-dragging &[data-dragging='true']:hover {
    outline: none !important;
  }

  .is-library-dragging &:not([data-dragging='true']):hover > .star,
  .is-library-dragging &:not([data-dragging='true']):hover .autochain,
  .is-library-dragging &:not([data-dragging='true']):hover .menu,
  .is-library-dragging &:not([data-dragging='true']):hover .dots {
    pointer-events: none !important;
  }

  .is-library-dragging &:not([data-dragging='true']) > .star,
  .is-library-dragging &:not([data-dragging='true']) .autochain,
  .is-library-dragging &:not([data-dragging='true']) .menu,
  .is-library-dragging &:not([data-dragging='true']):hover .dots {
    pointer-events: none !important;
    cursor: grabbing !important;
  }

  .is-library-dragging &[data-dragging='true'] {
    cursor: grabbing !important;
    outline: none !important;
  }

  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 8px;
    z-index: 1;
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
      return (
        theme.ketcher.monomer.color[code as string]?.regular ||
        theme.ketcher.monomer.color.default?.regular
      );
    }};
  }

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
    color: #cad3dd;
    position: absolute;
    left: calc(50% - 7px);
    top: 11px;
    font-size: 13px;
    line-height: 13px;
    opacity: 0;
    transition: 0.2s ease;
    flex-shrink: 0;
    border: 0;
    background: transparent;
    padding: 0;
    z-index: 10;
    cursor: pointer !important;
    pointer-events: auto;
    &.visible {
      visibility: visible;
      opacity: 1;
      color: #faa500;
    }
    &:hover {
      color: #faa500;
    }
    &:active {
      transform: scale(1.4);
    }
    &.visible:hover {
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

export const AutochainIcon = styled(Icon)<{ disabled?: boolean }>`
  color: #cad3dd;
  stroke-width: 0;
  opacity: 0;
  transition: 0.2s ease;
  flex-shrink: 0;
  width: 13px;
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')} !important;
  pointer-events: auto;
  &:active {
    transform: scale(1.2);
  }
  &:hover {
    color: ${({ disabled }) => (disabled ? '#cad3dd' : '#333333')};
  }
  .is-library-dragging & {
    cursor: grabbing !important;
    pointer-events: none !important;
  }
`;

export const AutochainIconWrapper = styled('div')({
  position: 'absolute',
  top: '12px',
  left: '4px',
  zIndex: 10,
  cursor: 'pointer',
  pointerEvents: 'auto',
  '.is-library-dragging &': {
    cursor: 'grabbing !important',
    pointerEvents: 'none',
  },
});

export const MenuIcon = styled(Icon)<{ disabled?: boolean }>`
  color: #cad3dd;
  stroke-width: 0;
  opacity: 0;
  transition: 0.2s ease;
  flex-shrink: 0;
  width: 13px;
  svg {
    pointer-events: none;
  }
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')} !important;
  pointer-events: auto;
  &:active {
    transform: scale(1.2);
  }
  &:hover {
    color: ${({ disabled }) => (disabled ? '#cad3dd' : '#333333')};
  }
`;

export const MenuIconWrapper = styled('div')({
  position: 'absolute',
  top: '12px',
  right: '4px',
  zIndex: 10,
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  pointerEvents: 'auto',
});
