import styled from '@emotion/styled';

export const DEFAULT_MINIATURE_SIZE = 150;

export const Container = styled.div<{ expanded?: boolean }>(
  ({ theme, expanded }) => ({
    display: 'flex',
    border: `1.5px solid ${theme.ketcher.outline.color}`,
    borderRadius: '6px',
    padding: 5,
    maxHeight: '100%',
    minHeight: `${DEFAULT_MINIATURE_SIZE}px`,
    height: expanded ? 'auto' : `${DEFAULT_MINIATURE_SIZE}px`,
    width: expanded ? 'auto' : `${DEFAULT_MINIATURE_SIZE}px`,
    alignSelf: 'stretch',
    '& svg': {
      maxWidth: 'fit-content',
      margin: 'auto',
    },
  }),
);
