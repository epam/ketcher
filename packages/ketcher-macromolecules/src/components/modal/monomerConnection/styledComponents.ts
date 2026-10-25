import styled from '@emotion/styled';

interface IStyledAttachmentPointNameProperties {
  disabled?: boolean;
}

export const AttachmentPoint = styled.div({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2px',
  alignItems: 'center',
  marginBottom: '5px',
});

export const AttachmentPointName = styled.span<IStyledAttachmentPointNameProperties>(
  (properties) => ({
    margin: 0,
    padding: 0,
    textAlign: 'center',
    display: 'block',
    font: properties.theme.ketcher.font.family.inter,
    fontSize: properties.theme.ketcher.font.size.small,
    fontWeight: properties.theme.ketcher.font.weight.regular,
    color: properties.disabled
      ? 'rgba(180, 185, 214, 1)'
      : properties.theme.ketcher.color.text.light,
  }),
);

export const ModalContent = styled.div(() => ({ height: '100%' }));
