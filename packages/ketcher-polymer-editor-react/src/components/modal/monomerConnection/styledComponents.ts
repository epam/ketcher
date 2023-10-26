import styled from '@emotion/styled';

export const Row = styled.div({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-evenly',
});

export const Column = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  alignItems: 'center',
});

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  gap: '10px',
  alignSelf: 'flex-start',
  width: 192,
});

export const AttachmentPoint = styled.div({
  width: 'calc(192px / 3 - 10px * 2 / 3)', // 2 - gaps, 3 - buttons
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

export const ConnectionSymbol = styled.div(({ theme }) => ({
  width: 20,
  height: 3,
  display: 'block',
  color: theme.ketcher.color.button.secondary.hover,
  backgroundColor: theme.ketcher.color.button.secondary.hover,
  borderRadius: 20,
  margin: '150px 20px 0',
}));
