import styled from '@emotion/styled';

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  alignSelf: 'flex-start',
  width: '100%',
});

interface IStyledAttachmentPointProps {
  lastElementInRow?: boolean;
}
interface IStyledAttachmentPointNameProps {
  disabled?: boolean;
}

export const AttachmentPoint = styled('div')<IStyledAttachmentPointProps>(
  (props) => ({
    display: 'flex',
    flexDirection: 'column',
    rowGap: '2px',
    alignItems: 'center',
    marginBottom: '5px',
    marginRight: !props.lastElementInRow ? '7px' : '',
  }),
);

export const AttachmentPointName = styled.span<IStyledAttachmentPointNameProps>(
  (props) => ({
    margin: 0,
    padding: 0,
    textAlign: 'center',
    display: 'block',
    font: props.theme.ketcher.font.family.inter,
    fontSize: props.theme.ketcher.font.size.small,
    fontWeight: props.theme.ketcher.font.weight.regular,
    color: props.disabled
      ? 'rgba(180, 185, 214, 1)'
      : props.theme.ketcher.color.text.light,
  }),
);

export const MonomerName = styled.div(({ theme }) => ({
  margin: 0,
  padding: 0,
  textAlign: 'center',
  display: 'block',
  font: theme.ketcher.font.family.inter,
  fontSize: theme.ketcher.font.size.regular,
  fontWeight: theme.ketcher.font.weight.regular,
  width: '150px',
  flexBasis: '200px',
}));

export const ConnectionSymbol = styled.div(({ theme }) => ({
  width: 10,
  height: 2,
  display: 'block',
  color: theme.ketcher.color.button.secondary.hover,
  backgroundColor: theme.ketcher.color.button.secondary.hover,
  borderRadius: 20,
  margin: '76px 12px 0',
}));

export const AttachmentPointSelectionContainer = styled.div(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  justifyContent: 'space-around',
  maxWidth: '150px',
}));

export const AttachmentPointsRow = styled.div(() => ({
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'flex-start',
  padding: '0 12px',
}));

export const MonomerNamesRow = styled.div(() => ({
  display: 'flex',
  gap: '34px',
  justifyContent: 'space-between',
  alignItems: 'flex-end',
  margin: '12px 12px 0px',
  paddingBottom: '6px',
}));

export const ModalContent = styled.div(() => ({}));
