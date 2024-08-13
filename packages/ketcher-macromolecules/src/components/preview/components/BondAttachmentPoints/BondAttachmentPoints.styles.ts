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
  connected?: boolean;
}

export const AttachmentPointName = styled.p<AttachmentPointNameProps>(
  ({ theme }) => ({
    margin: 0,
    fontSize: theme.ketcher.font.size.small,
    lineHeight: '12px',
  }),
);

interface LeavingGroupProps {
  inBond: boolean;
}

export const LeavingGroup = styled.p<LeavingGroupProps>(
  ({ inBond, theme }) => ({
    margin: 0,
    padding: '4px',
    fontWeight: theme.ketcher.font.weight.bold,
    lineHeight: '14px',
    borderRadius: '4px',
    backgroundColor: inBond ? '#CDF1FC' : 'transparent',
  }),
);
