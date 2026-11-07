import styled from '@emotion/styled';
import { MODAL_STATES, MODAL_STATES_VALUES } from './openModalStates';
import { ActionButton } from 'components/shared/actionButton';

interface OpenFileWrapperProperties {
  currentState: MODAL_STATES_VALUES;
}

export const OpenFileWrapper = styled.div<OpenFileWrapperProperties>`
  position: relative;
  padding: ${({ currentState }) =>
    currentState === MODAL_STATES.openOptions ? '10px 12px' : '0'};
`;

export const CancelButton = styled(ActionButton)`
  margin-inline-end: auto;
`;
