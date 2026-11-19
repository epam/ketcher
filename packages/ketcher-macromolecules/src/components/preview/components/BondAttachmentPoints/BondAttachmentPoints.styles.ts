import styled from '@emotion/styled';

interface AttachmentPointProperties {
  connected: boolean;
  inBond: boolean;
}

export const AttachmentPoint = styled.div<AttachmentPointProperties>(
  ({ connected, inBond, theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    color: inBond || !connected ? theme.ketcher.color.text.primary : '#B4B9D6',
  }),
);

interface AttachmentPointNameProperties {
  connected?: boolean;
}

export const AttachmentPointName = styled.p<AttachmentPointNameProperties>(
  ({ theme }) => ({
    margin: 0,
    fontSize: theme.ketcher.font.size.small,
    lineHeight: '12px',
  }),
);

interface LeavingGroupProperties {
  inBond: boolean;
}

export const LeavingGroup = styled.p<LeavingGroupProperties>(
  ({ inBond, theme }) => ({
    margin: 0,
    padding: '4px',
    fontWeight: theme.ketcher.font.weight.bold,
    lineHeight: '14px',
    borderRadius: '4px',
    backgroundColor: inBond ? '#CDF1FC' : 'transparent',
    minWidth: inBond ? '8px' : undefined,
    minHeight: inBond ? '14px' : undefined,
  }),
);
