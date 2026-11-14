import styled from '@emotion/styled';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 8px;
  background: ${(properties) => properties.theme.ketcher.color.background.primary};
  border: ${(properties) => properties.theme.ketcher.border.regular};
  border-radius: ${(properties) => properties.theme.ketcher.border.radius.regular};
  box-shadow: ${(properties) => properties.theme.ketcher.shadow.regular};
`;
