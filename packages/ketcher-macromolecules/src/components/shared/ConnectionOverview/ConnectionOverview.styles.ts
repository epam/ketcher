import styled from '@emotion/styled';

interface IStyledMonomerName {
  isExpanded?: boolean;
}

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
