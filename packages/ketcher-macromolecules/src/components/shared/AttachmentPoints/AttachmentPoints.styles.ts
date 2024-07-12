import styled from '@emotion/styled';

export const AttachmentPointsList = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

export const AttachmentPoint = styled.div<{ connected: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 4px;
  background-color: ${({ connected }) =>
    connected ? '#E1E5EA' : 'transparent'};
  padding: ${({ connected }) => (connected ? '4px' : '0')};
  color: ${({ connected }) => (connected ? '#8A8B8E' : 'inherit')};
`;

export const AttachmentPointID = styled.span`
  font-weight: 500;
`;

export const AttachmentPointLabel = styled.span`
  font-weight: 600;
`;
