import styled from '@emotion/styled';
import { Icon } from 'ketcher-react';

const StyledMonomerLibraryToggle = styled.div(({ theme }) => {
  return {
    margin: 0,
    fontSize: theme.ketcher.font.size.regular,
    color: theme.ketcher.color.text.secondary,
    position: 'absolute',
    cursor: 'pointer',
    top: 'calc(8px + 12px)',
    right: 'calc(4px + 12px)',
    visibility: 'visible',
    opacity: 1,
    whiteSpace: 'nowrap',
    display: 'flex',
    lineHeight: 1,
    padding: '5px 8px',
    borderRadius: '4px',
    userSelect: 'none',

    '& > span': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '&.icon': {
        marginRight: '2px',
      },
    },

    '&.hidden': {
      backgroundColor: theme.ketcher.color.button.primary.active,
      color: theme.ketcher.color.button.text.primary,
    },
  };
});

interface Props {
  isHidden: boolean;
  onClick: () => void;
}

const MonomerLibraryToggle = ({ isHidden, onClick }: Props) => {
  return (
    <StyledMonomerLibraryToggle
      className={isHidden ? 'hidden' : ''}
      onClick={onClick}
    >
      <span className="icon">
        {isHidden ? <Icon name="arrows-left" /> : <Icon name="arrows-right" />}
      </span>
      <span>{isHidden ? 'Show Library' : 'Hide'}</span>
    </StyledMonomerLibraryToggle>
  );
};

export { MonomerLibraryToggle };
