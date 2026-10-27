import styled from '@emotion/styled';
import { IconButton } from 'ketcher-react';

export const StyledToastContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const StyledToast = styled.div({
  backgroundColor: '#333333',
  minHeight: '40px',
  display: 'flex',
  alignItems: 'flex-start',
});

export const StyledToastContent = styled.div({
  maxWidth: '420px',
  padding: '8px 10px',
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
