import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'components';
import {
  ColorContainer,
  ColorItem,
  ColorSquare,
  Divider,
  standardColors,
} from './style';
import { Item, Submenu } from 'react-contexify';

interface HighlightMenuProps {
  onHighlight: (color: string) => void;
  disabled?: boolean;
}

const HighlightMenu: FC<HighlightMenuProps> = ({ onHighlight, disabled }) => {
  const { t } = useTranslation('toolbar');

  return (
    <Submenu
      data-testid="Highlight-option"
      label={t('highlight.label')}
      disabled={disabled}
    >
      <ColorContainer>
        {standardColors.map((color) => (
          <ColorItem
            key={color.name}
            data-testid={`${color.name}-option`}
            onClick={() => onHighlight(color.value)}
          >
            <ColorSquare color={color.value} />
          </ColorItem>
        ))}
      </ColorContainer>
      <Divider />
      <Item data-testid="No highlight-option" onClick={() => onHighlight('')}>
        <div
          style={{
            marginLeft: '-10px',
          }}
        >
          <Icon name="no-highlight-cross" />
          <span style={{ marginLeft: '10px' }}>
            {t('highlight.noHighlight')}
          </span>
        </div>
      </Item>
    </Submenu>
  );
};

export default HighlightMenu;
