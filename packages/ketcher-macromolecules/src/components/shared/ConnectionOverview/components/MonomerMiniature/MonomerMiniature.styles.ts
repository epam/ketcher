import styled from '@emotion/styled';

export const Container = styled.div<{ expanded?: boolean }>(
  ({ theme, expanded }) => ({
    display: 'flex',
    border: `1.5px solid ${theme.ketcher.outline.color}`,
    borderRadius: '6px',
    padding: 5,
    maxHeight: '100%',
    minHeight: '150px',
    height: expanded ? 'auto' : '150px',
    width: expanded ? 'auto' : '150px',
    alignSelf: 'stretch',
    '& svg': {
      maxWidth: 'fit-content',
      margin: 'auto',
    },
  }),
);
