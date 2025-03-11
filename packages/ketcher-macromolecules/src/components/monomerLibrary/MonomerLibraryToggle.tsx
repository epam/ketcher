import styled from '@emotion/styled';
import { Icon } from 'ketcher-react';
import { MONOMER_LIBRARY_WIDTH } from './styles';

const StyledMonomerLibraryToggle = styled.div(({ theme }) => {
  return {
    margin: 0,
    fontSize: theme.ketcher.font.size.regular,
    color: theme.ketcher.color.text.secondary,
    position: 'absolute',
    top: '12px',
    right: `calc(${MONOMER_LIBRARY_WIDTH} + 12px)`,
    cursor: 'pointer',
    visibility: 'visible',
    opacity: 1,
    whiteSpace: 'nowrap',
    display: 'flex',
    lineHeight: 1,
    borderRadius: '4px 0 0 4px',
    userSelect: 'none',
    backgroundColor: theme.ketcher.color.background.primary,
    padding: '12px 4px',

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
      right: '12px',
      padding: '11px 8px',
      borderRadius: '4px',
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
        <Icon name={isHidden ? 'arrows-left' : 'arrows-right'} />
      </span>
      {isHidden && <span>Show Library</span>}
    </StyledMonomerLibraryToggle>
  );
};

export { MonomerLibraryToggle };
