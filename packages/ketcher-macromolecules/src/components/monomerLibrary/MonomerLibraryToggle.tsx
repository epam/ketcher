import styled from '@emotion/styled';
import { Icon } from 'ketcher-react';

const StyledMonomerLibraryToggle = styled.div(({ theme }) => {
  return {
    margin: 0,
    fontSize: theme.ketcher.font.size.regular,
    position: 'absolute',
    top: '12px',
    cursor: 'pointer',
    visibility: 'visible',
    opacity: 1,
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    lineHeight: 1,
    userSelect: 'none',
    backgroundColor: theme.ketcher.color.button.primary.active,
    color: theme.ketcher.color.button.text.primary,
    right: '12px',
    padding: '10px 8px',
    borderRadius: '4px',

    '& > span': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '&.icon': {
        marginRight: '2px',
      },
    },
  };
});

interface Props {
  onClick: () => void;
}

const MonomerLibraryToggle = ({ onClick }: Props) => {
  return (
    <StyledMonomerLibraryToggle
      onClick={onClick}
      data-testid="show-monomer-library"
    >
      <span className="icon">
        <Icon name="arrows-left" />
      </span>
      Show Library
    </StyledMonomerLibraryToggle>
  );
};

export { MonomerLibraryToggle };
