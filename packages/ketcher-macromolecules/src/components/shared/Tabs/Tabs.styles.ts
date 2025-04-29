import styled from '@emotion/styled';
import { Tab, Tabs } from '@mui/material';

export const StyledTabs = styled(Tabs)<{ isLayoutToRight?: boolean }>`
  height: 32px;
  min-height: 32px;
  list-style-type: none;
  margin: 0;
  padding: 4px 8px 0 8px;
  border-bottom: ${({ theme }) =>
    `1px solid ${theme.ketcher.color.border.primary}`};
  overflow: unset;

  & .MuiTabs-scroller,
  & .MuiTabs-flexContainer {
    height: 100%;
    overflow: unset !important;
  }

  & .MuiTabs-flexContainer {
    justify-content: ${({ isLayoutToRight }) =>
      isLayoutToRight ? 'flex-end' : 'flex-start'};
    padding-right: ${({ isLayoutToRight }) => (isLayoutToRight ? '16px' : '0')};
  }

  & .MuiTabs-indicator {
    display: none;
  }
`;

export const StyledTab = styled(Tab)<{
  isLayoutToRight?: boolean;
  isFirstTabFavorite?: boolean;
}>`
  min-height: 24px;
  min-width: 0;
  position: relative;
  padding: 7px 12px;
  font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  text-transform: none;
  cursor: pointer;
  text-align: center;
  background-color: ${({ theme }) => theme.ketcher.color.tab.regular};
  color: ${({ theme }) => theme.ketcher.color.text.light};
  list-style-type: none;
  margin-left: 1px;
  align-items: center;
  flex: ${({ isLayoutToRight }) => (isLayoutToRight ? undefined : '1 1 auto;')};
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 4px 4px 0 0;

  &:first-of-type {
    margin-left: 0;
  }

  &:hover {
    background-color: ${({ theme }) => theme.ketcher.color.tab.regular};
    color: ${({ theme }) => theme.ketcher.color.text.primary};
    border-color: ${({ theme }) => theme.ketcher.color.border.primary};
  }

  &.Mui-selected {
    background-color: ${({ theme }) => theme.ketcher.color.tab.active};
    color: ${({ theme }) => theme.ketcher.color.text.primary};
    border-color: ${({ theme }) => theme.ketcher.color.border.primary};
    margin-bottom: -1px;
    padding-bottom: 8px;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px; /* Adjust to cover the parent's bottom border */
      height: 1px;
      background-color: ${({ theme }) => theme.ketcher.color.tab.active};
    }
  }

  &[data-tab='Favorites'] {
    font-size: 16px;
    color: #faa500;
  }
`;

export const HiddenTab = styled(Tab)`
  width: 0;
  height: 0;
  min-width: 0;
  min-height: 0;
  padding: 0;
  margin: 0;
  visibility: hidden;
`;

export const TabPanelContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
`;
