import styled from '@emotion/styled';

export const Container = styled.div`
  padding: 4px 8px;
  background: ${(properties) => properties.theme.ketcher.color.background.primary};
  border: ${(properties) => properties.theme.ketcher.border.regular};
  border-radius: ${(properties) => properties.theme.ketcher.border.radius.regular};
  box-shadow: ${(properties) => properties.theme.ketcher.shadow.regular};
  font-size: 12px;
  white-space: nowrap;
`;
