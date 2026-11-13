import { renderHook } from '@testing-library/react';
import { AttachmentPointsToBonds } from 'ketcher-core';
import { useAttachmentPoints } from './useAttachmentPoints';

describe('useAttachmentPoints', () => {
  const bond = {} as NonNullable<AttachmentPointsToBonds['R1']>;

  it('distinguishes a bond from null or undefined own entries without caps', () => {
    const { result } = renderHook(() =>
      useAttachmentPoints({
        monomerCaps: undefined,
        attachmentPointsToBonds: { R1: bond, R2: null, R3: undefined },
      }),
    );

    expect(result.current).toEqual({
      connectedAttachmentPoints: ['R1'],
      preparedAttachmentPointsData: [
        { id: 'R1', label: '', connected: true },
        { id: 'R2', label: '', connected: false },
        { id: 'R3', label: '', connected: false },
      ],
    });
  });

  it('retains empty cap labels without treating null bond entries as connected', () => {
    const { result } = renderHook(() =>
      useAttachmentPoints({
        monomerCaps: { R1: '', R2: 'H', R3: 'OH' },
        attachmentPointsToBonds: { R1: bond, R2: null },
      }),
    );

    expect(result.current).toEqual({
      connectedAttachmentPoints: ['R1'],
      preparedAttachmentPointsData: [
        { id: 'R1', label: '', connected: true },
        { id: 'R2', label: 'H', connected: false },
        { id: 'R3', label: 'OH', connected: false },
      ],
    });
  });
});
