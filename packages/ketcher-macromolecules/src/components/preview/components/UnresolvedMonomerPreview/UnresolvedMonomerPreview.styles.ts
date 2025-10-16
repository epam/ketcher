import styled from '@emotion/styled';

export const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 5px;
  color: #7c7c7f;
  border: 1.5px solid ${(props) => props.theme.ketcher.outline.color};
  border-radius: 6px;
  max-height: 100%;
  min-height: 150px;
  height: 150px;
  width: 150px;
  align-self: stretch;
`;
