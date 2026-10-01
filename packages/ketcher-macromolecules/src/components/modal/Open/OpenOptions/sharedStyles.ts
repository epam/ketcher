import styled from '@emotion/styled';

export const OpenOptionText = styled.p`
  font-size: 10px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.ketcher.color.text.light};
  margin: 0;
  text-align: center;
  line-height: 12px;
`;

export const DisabledText = styled.p`
  font-size: 10px;
  margin: 0;
  text-align: center;
  color: ${({ theme }) => theme.ketcher.color.text.primary};
  opacity: 50%;
  line-height: 12px;
`;
