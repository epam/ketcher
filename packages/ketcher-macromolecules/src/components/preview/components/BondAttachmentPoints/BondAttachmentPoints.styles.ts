import styled from '@emotion/styled';

interface AttachmentPointProps {
  connected: boolean;
  inBond: boolean;
}

export const AttachmentPoint = styled.div<AttachmentPointProps>(
  ({ connected, inBond, theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    color: inBond || !connected ? theme.ketcher.color.text.primary : '#B4B9D6',
  }),
);

interface AttachmentPointNameProps {
  connected: boolean;
  inBond: boolean;
}

export const AttachmentPointName = styled.p<AttachmentPointNameProps>(
  ({ theme, connected, inBond }) => ({
    margin: 0,
    padding: '4px 6px',
    fontSize: theme.ketcher.font.size.small,
    fontWeight: theme.ketcher.font.weight.bold,
    lineHeight: '12px',
    borderRadius: '4px',
    color: inBond
      ? theme.ketcher.color.button.text.primary
      : connected
      ? '#B4B9D6'
      : theme.ketcher.color.text.primary,
    backgroundColor: inBond
      ? theme.ketcher.color.button.primary.active
      : 'transparent',
  }),
);

export const LeavingGroup = styled.p(({ theme }) => ({
  margin: 0,
  padding: '4px',
  fontWeight: theme.ketcher.font.weight.bold,
  lineHeight: '14px',
  borderRadius: '4px',
  backgroundColor: 'transparent',
}));
