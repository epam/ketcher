import styled from '@emotion/styled';
import { Tab, Tabs } from '@mui/material';

export const StyledTabs = styled(Tabs)`
  height: 32px;
  min-height: 32px;
  list-style-type: none;
  margin: 0;
  padding: 4px 8px 0 8px;

  & .MuiTabs-indicator {
    display: none;
  }
`;

export const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 24,
  minWidth: 0,
  padding: '7px 12px',
  fontSize: theme.ketcher.font.size.regular,
  textTransform: 'none',
  cursor: 'pointer',
  textAlign: 'center',
  backgroundColor: theme.ketcher.color.tab.regular,
  color: theme.ketcher.color.text.light,
  listStyleType: 'none',
  marginLeft: '1px',
  flex: '1 1 auto',
  alignItems: 'center',
  border: `1px solid transparent`,
  borderBottom: `1px solid ${theme.ketcher.color.border.primary}`,
  borderRadius: '4px 4px 0 0',

  '&:first-of-type': {
    marginLeft: 0,
  },

  '&:hover': {
    backgroundColor: theme.ketcher.color.tab.regular,
    color: theme.ketcher.color.text.primary,
    border: `1px solid ${theme.ketcher.color.border.primary}`,
  },

  '&.Mui-selected': {
    backgroundColor: theme.ketcher.color.tab.active,
    color: theme.ketcher.color.text.primary,
    border: `1px solid ${theme.ketcher.color.border.primary}`,
    borderBottom: '1px solid transparent',
  },

  // Probably not the best way to do so
  '&[data-testid="FAVORITES-TAB"]': {
    color: '#faa500',
  },
}));

export const TabPanelContent = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
`;
