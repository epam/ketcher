import styled from '@emotion/styled';
import { Button, Popover } from '@mui/material';

export const ElementAndDropdown = styled('div')`
  position: relative;
`;

export const DropDownButton = styled(Button)`
  display: flex;
  color: ${({ theme }) => theme.ketcher.color.dropdown.primary};
  padding-right: 0;
  padding-left: 0;

  & svg {
    margin-left: 2px;
    width: 1rem;
    height: 1rem;
  }
`;

export const ZoomLabel = styled('span')`
  width: 35px;
`;

export const Dropdown = styled(Popover)`
  & .MuiPopover-paper {
    padding: 8px;
    width: 175px;
    border: none;
    border-radius: 0px 0px 4px 4px;
    box-shadow: ${({ theme }) => theme.ketcher.shadow.regular};
    box-sizing: border-box;
  }
`;

export const DropDownContent = styled('div')`
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  word-break: keep-all;
  background: white;
`;

export const ZoomControlButton = styled(Button)`
  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  line-height: 14px;
  padding: 7px 8px;
  text-transform: none;
  color: ${({ theme }) => theme.ketcher.color.dropdown.primary};
`;

export const ShortcutLabel = styled('span')`
  color: #cad3dd;
`;

export const StyledInput = styled('input')`
  border: 1px solid #cad3dd;
  border-radius: 4px;
  padding: 3px 8px;
  color: ${({ theme }) => theme.ketcher.color.text.light};
  font-size: ${({ theme }) => theme.ketcher.font.size.medium};
  line-height: 16px;
  margin-bottom: 8px;

  &:hover {
    border-color: ${({ theme }) => theme.ketcher.color.input.border.hover};
  }

  &:active,
  &:focus {
    border-color: ${({ theme }) => theme.ketcher.outline.selected.color};
    outline: none;
  }

  &::after,
  &::before {
    display: none;
  }
`;
