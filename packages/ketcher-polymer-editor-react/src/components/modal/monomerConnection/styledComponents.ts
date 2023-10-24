import styled from '@emotion/styled';

export const Row = styled.div({
  display: 'flex',
  alignItems: 'start',
  justifyContent: 'space-between',
});

export const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  gap: '10px',
});

export const AttachmentPoint = styled.div({
  flexBasis: 'calc(100% / 3 - 10px * 2 / 3)', // 2 - gaps, 3 - buttons
  display: 'flex',
  flexDirection: 'column',
  rowGap: '5px',
});

export const AttachmentPointName = styled.span(({ theme }) => ({
  margin: 0,
  padding: 0,
  textAlign: 'center',
  display: 'block',
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular,
}));

export const MonomerName = styled.h3(({ theme }) => ({
  margin: 0,
  padding: 0,
  textAlign: 'center',
  display: 'block',
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular,
}));
