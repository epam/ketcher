import { FC } from 'react';
import { Icon } from 'components';
import {
  ColorContainer,
  ColorItem,
  ColorSquare,
  StandardColorsText,
  standardColors,
} from './style';
import { Submenu } from 'react-contexify';

interface HighlightMenuProps {
  onHighlight: (color: string) => void;
}

const HighlightMenu: FC<HighlightMenuProps> = ({ onHighlight }) => {
  return (
    <Submenu label="Highlight">
      <StandardColorsText disabled>Standard colors</StandardColorsText>
      <ColorContainer>
        {standardColors.map((color) => (
          <ColorItem key={color.name} onClick={() => onHighlight(color.value)}>
            <ColorSquare color={color.value} />
          </ColorItem>
        ))}
      </ColorContainer>
      <StandardColorsText onClick={() => onHighlight('')}>
        <Icon name="no-highlight-cross" />
        <span style={{ marginLeft: '10px' }}>No highlight</span>
      </StandardColorsText>
    </Submenu>
  );
};

export default HighlightMenu;
