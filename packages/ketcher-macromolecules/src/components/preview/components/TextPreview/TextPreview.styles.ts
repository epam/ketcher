import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 4px 8px;
  background: ${(props) => props.theme.ketcher.color.background.primary};
  border: ${(props) => props.theme.ketcher.border.regular};
  border-radius: ${(props) => props.theme.ketcher.border.radius.regular};
  box-shadow: ${(props) => props.theme.ketcher.shadow.regular};
  font-size: 12px;
  white-space: nowrap;
`;
