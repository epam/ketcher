import styled from '@emotion/styled';
import { MODAL_STATES, MODAL_STATES_VALUES } from './Open';

interface OpenFileWrapperProps {
  currentState: MODAL_STATES_VALUES;
}

export const OpenFileWrapper = styled.div<OpenFileWrapperProps>`
  position: relative;
  padding: ${({ currentState }) =>
    currentState === MODAL_STATES.openOptions ? '10px 12px' : '0'};
`;
