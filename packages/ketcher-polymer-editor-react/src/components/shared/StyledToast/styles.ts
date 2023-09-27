import styled from '@emotion/styled';
import { IconButton } from 'ketcher-react';

export const StyledToast = styled.div({
  backgroundColor: '#333333',
  maxHeight: '40px',
  display: 'flex',
  alignItems: 'stretch',
});

export const StyledToastContent = styled.div({
  maxWidth: '356px',
  padding: '4px 10px 4px 10px',
  color: 'white',
  display: 'flex',
});

export const StyledIconButton = styled(IconButton)`
  color: white;
  width: 24px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: #585858;
    color: white;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;
