import styled from '@emotion/styled';
import { MODAL_STATES, MODAL_STATES_VALUES } from './Open';
import { ActionButton } from 'components/shared/actionButton';

interface OpenFileWrapperProps {
  currentState: MODAL_STATES_VALUES;
}

export const OpenFileWrapper = styled.div<OpenFileWrapperProps>`
  position: relative;
  padding: ${({ currentState }) =>
    currentState === MODAL_STATES.openOptions ? '10px 12px' : '0'};
`;

export const CancelButton = styled(ActionButton)`
  margin-right: auto;
`;
