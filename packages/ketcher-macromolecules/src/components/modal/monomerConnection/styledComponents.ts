import styled from '@emotion/styled';

export const AttachmentPointList = styled.div({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  alignSelf: 'flex-start',
  width: '100%',
  gap: '7px',
});

export const UnknownStructureContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 2%;
  color: #7c7c7f;
  border: 1px solid #cad3dd;
  width: 100%;
  height: 100%;
`;

interface IStyledAttachmentPointNameProps {
  disabled?: boolean;
}

interface IStyledMonomerName {
  isExpanded?: boolean;
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

export const MonomerName = styled.div<IStyledMonomerName>(
  ({ theme, isExpanded }) => ({
    margin: 0,
    padding: 0,
    textAlign: 'center',
    alignSelf: 'flex-end',
    display: 'block',
    font: theme.ketcher.font.family.inter,
    fontSize: theme.ketcher.font.size.regular,
    fontWeight: theme.ketcher.font.weight.regular,
    flexBasis: '200px',
    lineHeight: '14px',
    maxWidth: isExpanded ? undefined : '150px',
  }),
);

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
  gridTemplateRows: 'auto auto auto',
  gridTemplateColumns: '1fr 10px 1fr',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '12px',
  paddingBottom: 0,
  height: '100%',
  columnGap: '12px',
  rowGap: '8px',
}));

export const ModalContent = styled.div(() => ({ height: '100%' }));
