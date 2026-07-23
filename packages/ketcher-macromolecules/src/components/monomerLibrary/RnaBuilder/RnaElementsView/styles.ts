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
import { Accordion, Button } from 'ketcher-react';
import { Tab } from '@mui/material';
import { ActionButton } from 'components/shared/actionButton';

export const RnaAccordionContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  height: 100%;
`;

export const StyledAccordion = styled(Accordion)`
  min-height: 32px;
`;

export const StyledAccordionWrapper = styled.div`
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  min-height: 0;

  /*
   * The phosphate filter popup is positioned absolutely relative to the
   * preset toolbar. The Accordion library wraps content in a container with
   * \`overflow: hidden\` and a details container with \`overflow-y: auto\`,
   * which clip the popup vertically when only a few presets match (so the
   * details container is short).
   *
   * Override these so the popup can escape vertically. Vertical scrolling for
   * long preset lists is moved to PresetsScrollArea below, which sits
   * **after** the toolbar — the toolbar (and its popup) is therefore outside
   * the scroll area and never clipped.
   */
  > div {
    overflow: visible;
    display: flex;
    flex-direction: column;
    min-height: 0;

    /* Accordion's inner details container (sibling of the summary). */
    > div + div {
      overflow: visible;
      display: flex;
      flex-direction: column;
      min-height: 0;
      flex: 1 1 auto;
    }
  }
`;

// Scrollable area for the presets list inside the accordion's Presets
// section. Placed after the toolbar so the filter popup can extend beyond
// the visible area without being clipped.
export const PresetsScrollArea = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

export const DetailsContainer = styled.div<{ compact?: boolean }>`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: start;
  padding: ${({ compact }) => (compact ? '4px' : '8px')};
  /* Fill the accordion's details container so PresetsScrollArea can take
   * the remaining vertical space. The tabs view uses \`compact\` and is
   * sized by its own ancestors. */
  ${({ compact }) => (compact ? '' : 'flex: 1 1 auto; min-height: 0;')}
`;

export const RnaTabContent = styled.div`
  flex-grow: 1;
  min-height: 0;
  background-color: #f7f9fa;
  border-radius: 4px;
  margin: 4px 8px;
  padding: 4px;

  &.first-tab {
    border-radius: 0 4px 4px 4px;
  }

  &.last-tab {
    border-radius: 4px 0 4px 4px;
  }
`;

export const CompactDetailsContainer = styled.div`
  height: 100%;
  background-color: ${({ theme }) => theme.ketcher.color.tab.content};
  border-radius: 2px;
  overflow: auto;
`;

export const StyledButton = styled(Button)`
  background-color: ${({ theme }) =>
    theme.ketcher.color.button.transparent.active};
  color: ${({ theme }) => theme.ketcher.color.text.light};
  border-color: ${({ theme }) => theme.ketcher.color.text.light};
`;

// Toolbar containing the "New Preset" button and the filter icon button.
export const PresetToolbar = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
`;

// "New Preset" button takes 1/3 of the library (toolbar) width and is
// left-aligned within the toolbar.
export const NewPresetButton = styled(StyledButton)`
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
`;

export const FilterIconButton = styled.button<{
  active?: boolean;
  hasIndicator?: boolean;
}>`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin-left: auto;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: #333333;

  > svg {
    width: 16px;
    height: 16px;
  }

  /* Indicator dot shown in the top-right corner of the filter icon when the
   * current filter state differs from the default (all options off). */
  ${({ hasIndicator, theme }) =>
    hasIndicator
      ? `
    &::after {
      content: '';
      position: absolute;
      top: 5px;
      right: 5px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      border: 1px solid #E1E5EA;
      background-color: ${theme.ketcher.color.button.primary.active};
    }
  `
      : ''}
`;

export const FilterPopup = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 160px;
  padding: 4px;
  background-color: #ffffff;
  border: 1px solid #cad3dd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  font-size: 12px;
  color: ${({ theme }) => theme.ketcher.color.text.primary};
`;

export const FilterPopupOption = styled.label`
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  user-select: none;
  margin-left: 6px;
  margin-top: 10px;
`;

// Styled checkbox matching the project's default checkbox appearance
// (mirrors packages/ketcher-react/src/script/ui/component/form/Input/Input.module.less).
// The native input is visually hidden, and the adjacent span renders the SVG.
// TODO move checkbox to separate component
export const StyledCheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;

  & + span {
    display: inline-block;
    width: 16px;
    height: 16px;
    vertical-align: middle;
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='0.5' y='0.5' width='15' height='15' rx='3.5' fill='white' stroke='%23B4B9D6'/%3E%3C/svg%3E%0A");
    background-repeat: no-repeat;
    background-size: 100%;
  }

  &:checked + span {
    background-image: url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' rx='4' fill='%23167782'/%3E%3Cpath d='M6.33711 11.8079L2.42578 7.63124L3.39911 6.71991L6.36845 9.89124L12.6171 3.64258L13.5598 4.58524L6.33711 11.8079Z' fill='white'/%3E%3C/svg%3E%0A");
  }
`;

export const FilterPopupTitle = styled.div`
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0.4px;
  margin: 5px 0 5px 2px;
  color: ${({ theme }) => theme.ketcher.color.text.primary};
`;

export const FilterPopupSeparator = styled.hr`
  width: 100%;
  height: 1px;
  margin: 8px 0 4px;
  border: none;
  background-color: #e1e5ea;
`;

export const FilterPopupActions = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
`;

// Width-by-content overrides for the filter popup action buttons.
// ActionButton hard-codes a fixed width (62/72px); we widen the auto-sizing
// rule with min-width: unset so the button hugs its label + horizontal padding.
export const FilterPopupActionButton = styled(ActionButton)`
  &.MuiButtonBase-root {
    width: auto;
    min-width: unset;
    padding-left: 7px;
    padding-right: 7px;
    border-radius: 4px;
  }
`;

// Secondary variant of the filter popup action button without a border
// (per design spec for the "Reset all" button). Pushed to the far left of the
// actions row so the primary "Set" button sits at the right.
export const FilterPopupResetButton = styled(FilterPopupActionButton)`
  &.MuiButtonBase-root {
    border: none;
    margin-right: auto;
    padding-left: 0;
    margin-left: 6px;
    color: #167782;
  }
`;

export const DisabledArea = styled.div`
  width: 100%;
  height: 100%;
  background-color: #eff2f594;
  position: absolute;
  top: 0;
  left: 0;
`;

export const RnaTabsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px 0;
`;

export const RnaTabWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  &.rna-tab--selected {
    & button {
      border-radius: 4px 4px 0 0;
      background-color: #f7f9fa;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      right: 0;
      height: 8px;
      background-color: #f7f9fa;
    }
  }
`;

export const RnaTab = styled(Tab)<{ selected?: boolean }>`
  height: 24px;
  min-height: 24px;
  min-width: 24px;
  ${({ selected }) => (selected ? 'min-width: 104px;' : '')}
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 4px;
  ${({ selected }) => (selected ? 'margin-top: -8px;' : '')}
  font-weight: 400;
  font-size: 10px;
  border-radius: 4px;
  background-color: white;
  opacity: ${({ selected }) => (selected ? 1 : 0.6)};
  text-transform: none;

  &:hover {
    background-color: #f3f8f9;
  }

  > svg {
    height: 16px;
    width: 16px;
    color: #b4b9d6;

    &.MuiTab-iconWrapper {
      margin: 0;
    }
  }
`;
