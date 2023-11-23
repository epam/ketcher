import styled from '@emotion/styled';

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'start',
  alignSelf: 'flex-start',
  width: '100%',
  gap: '8px',
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
  margin: 'auto',
}));

export const AttachmentPointsRow = styled.div(() => ({
  display: 'grid',
  gridAutoFlow: 'column',
  gridTemplateRows: '1em auto auto',
  gridTemplateColumns: '1fr 10px 1fr',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '12px',
  height: '100%',
  gap: '8px',
}));

export const ModalContent = styled.div(() => ({ height: '100%' }));
