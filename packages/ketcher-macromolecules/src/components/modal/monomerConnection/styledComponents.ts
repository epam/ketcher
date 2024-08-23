import styled from '@emotion/styled';

interface IStyledAttachmentPointNameProps {
  disabled?: boolean;
}

export const AttachmentPoint = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2px',
  alignItems: 'center',
  marginBottom: '5px',
}));

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

export const ModalContent = styled.div(() => ({ height: '100%' }));
