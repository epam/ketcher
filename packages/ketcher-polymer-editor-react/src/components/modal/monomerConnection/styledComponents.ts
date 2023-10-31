import styled from '@emotion/styled';

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  gap: '10px',
  alignSelf: 'flex-start',
  maxWidth: 197,
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
  maxWidth: '200px',
  flexBasis: '200px',
}));

export const ConnectionSymbol = styled.div(({ theme }) => ({
  width: 20,
  height: 3,
  display: 'block',
  color: theme.ketcher.color.button.secondary.hover,
  backgroundColor: theme.ketcher.color.button.secondary.hover,
  borderRadius: 20,
  margin: '100px 20px 0',
}));

export const AttachmentPointSelectionContainer = styled.div(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  justifyContent: 'space-around',
}));

export const AttachmentPointsRow = styled.div(() => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
}));

export const MonomerNamesRow = styled.div(() => ({
  display: 'flex',
  gap: '34px',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  paddingBottom: '10px',
}));

export const ModalContent = styled.div(() => ({
  padding: '0 10px',
}));
