import styled from '@emotion/styled';
import { Menu } from 'react-contexify';

export const StyledMenu = styled(Menu)`
  --contexify-activeItem-bgColor: rgba(243, 245, 247, 1);
  --contexify-menu-minWidth: 140px;
  --contexify-activeItem-color: rgba(51, 51, 51, 1);
  --contexify-menu-padding: 4px;
  --contexify-itemContent-padding: 6px 8px;
  --contexify-separator-margin: 4px 0;
  --contexify-separator-color: #e1e5ea;
  .contexify_itemContent {
    font-family: ${({ theme }) => theme.ketcher.font.family.inter};
    font-size: ${({ theme }) => theme.ketcher.font.size.regular};
    height: 28px;
  }
  .contexify_item-title {
    opacity: 1;
    font-weight: bold;
    background: #e1e5ea;
    margin: -4px 0 4px -4px;
    width: calc(100% + 8px);
    border-radius: 4px 4px 0 0;
  }
  .context_menu-icon {
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    margin-right: 4px;
  }
  .context_menu-text {
    display: flex;
    align-items: center;
    line-height: ${({ theme }) => theme.ketcher.font.size.regular};
  }
  .context_menu-delete-text {
    display: flex;
    align-items: center;
    line-height: ${({ theme }) => theme.ketcher.font.size.regular};
    margin-left: -3px;
  }
`;
