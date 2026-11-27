import { renderHook } from '@testing-library/react';
import { useAttachmentPoints } from './useAttachmentPoints';
import useIDTAliasesTextForMonomer from './useIDTAliasesTextForMonomer';

describe('preview hook dictionary lookups', () => {
  it('groups IDT aliases whose bases match inherited property names', () => {
    const { result } = renderHook(() =>
      useIDTAliasesTextForMonomer({
        idtAliases: {
          base: 'X',
          modifications: {
            endpoint5: '/5constructor/',
            endpoint3: '/3constructor/',
            internal: '/i__proto__/',
          },
        },
        attachmentPointsToBonds: undefined,
      }),
    );

    expect(result.current).toBe('(5, 3)constructor, (i)__proto__');
  });

  it('ignores inherited bond entries and preserves falsy own entries', () => {
    const bonds = Object.assign(Object.create({ R1: {} }), { R2: null });
    const { result } = renderHook(() =>
      useAttachmentPoints({
        monomerCaps: { R1: 'H', R2: 'OH' },
        attachmentPointsToBonds: bonds,
      }),
    );

    expect(result.current.connectedAttachmentPoints).toEqual([]);
    expect(result.current.preparedAttachmentPointsData).toEqual([
      { id: 'R1', label: 'H', connected: false },
      { id: 'R2', label: 'OH', connected: false },
    ]);
  });
});
