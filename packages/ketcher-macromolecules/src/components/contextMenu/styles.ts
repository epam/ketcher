import styled from '@emotion/styled';
import { Menu } from 'react-contexify';

export const StyledMenu = styled(Menu)`
  --contexify-activeItem-bgColor: rgba(243, 245, 247, 1);
  --contexify-menu-minWidth: 140px;
  --contexify-activeItem-color: rgba(51, 51, 51, 1);
  .contexify_itemContent {
    font-family: ${({ theme }) => theme.ketcher.font.family.inter};
    font-size: ${({ theme }) => theme.ketcher.font.size.regular};
  }
  .contexify_separator {
    color: rgba(225, 229, 234, 1);
  }
  .contexify_item-title {
    opacity: 1;
    font-weight: bold;
  }
`;
