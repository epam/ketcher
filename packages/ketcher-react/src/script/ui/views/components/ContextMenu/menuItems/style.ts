import { Item, Submenu } from 'react-contexify';
import styled from '@emotion/styled';

export const standardColors = [
  { name: 'Red', value: '#F64D3C' },
  { name: 'Orange', value: '#FF9A25' },
  { name: 'Yellow', value: '#FFEA4E' },
  { name: 'Green', value: '#8BC152' },
  { name: 'Blue', value: '#00BBD3' },
  { name: 'Purple', value: '#EE82EE' },
  { name: 'Pink', value: '#FF69B4' },
  { name: 'Magenta', value: '#FF00FF' },
];

export const StyledSubmenu = styled(Submenu)`
  width: 150px;!important;
`;

export const ColorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 30px);
  padding: 0 5px 0 5px;
  gap: 10px;
`;

export const ColorSquare = styled.span<{ color: string }>`
  width: 30px;
  height: 30px;
  background-color: ${(props) => props.color};
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    outline: 4px solid #00bbd3;
  }

  &.active {
    outline: 4px solid #00bbd3;
  }
`;
export const ColorItem = styled(Item)`
  .contexify_itemContent {
    padding: 0 !important;
  }
`;
export const StandardColorsText = styled(Item)`
  font-size: 15px;
  line-height: 14px;
  font-weight: 400;
  color: #333333 !important;
  padding: 5px 0 5px 0;
  opacity: 1 !important;
  margin-left: -10px;
`;
