import { renderHook } from '@testing-library/react';
import { AttachmentPointsToBonds, IKetIdtAliases } from 'ketcher-core';
import useIDTAliasesTextForMonomer from './useIDTAliasesTextForMonomer';

const idtAliases: IKetIdtAliases = {
  base: '/P/',
  modifications: {
    endpoint3: '/3Pos/',
    endpoint5: '/5Pos/',
    internal: '/iPos/',
  },
};

describe('useIDTAliasesTextForMonomer', () => {
  it('returns endpoint3 alias when R1 is connected and R2 is not connected', () => {
    const attachmentPointsToBonds = {
      R1: { id: 'bond-r1' },
      R2: null,
    } as unknown as AttachmentPointsToBonds;

    const { result } = renderHook(() =>
      useIDTAliasesTextForMonomer({
        idtAliases,
        attachmentPointsToBonds,
      }),
    );

    expect(result.current).toBe('3Pos');
  });

  it('returns endpoint3 alias when R2 is undefined', () => {
    const attachmentPointsToBonds = {
      R1: { id: 'bond-r1' },
    } as unknown as AttachmentPointsToBonds;

    const { result } = renderHook(() =>
      useIDTAliasesTextForMonomer({
        idtAliases,
        attachmentPointsToBonds,
      }),
    );

    expect(result.current).toBe('3Pos');
  });

  it('returns endpoint5 alias when R1 is not connected and R2 is connected', () => {
    const attachmentPointsToBonds = {
      R1: null,
      R2: { id: 'bond-r2' },
    } as unknown as AttachmentPointsToBonds;

    const { result } = renderHook(() =>
      useIDTAliasesTextForMonomer({
        idtAliases,
        attachmentPointsToBonds,
      }),
    );

    expect(result.current).toBe('5Pos');
  });

  it('returns endpoint5 alias when R1 is undefined and R2 is connected', () => {
    const attachmentPointsToBonds = {
      R2: { id: 'bond-r2' },
    } as unknown as AttachmentPointsToBonds;

    const { result } = renderHook(() =>
      useIDTAliasesTextForMonomer({
        idtAliases,
        attachmentPointsToBonds,
      }),
    );

    expect(result.current).toBe('5Pos');
  });

  it('returns internal alias when both R1 and R2 are connected', () => {
    const attachmentPointsToBonds = {
      R1: { id: 'bond-r1' },
      R2: { id: 'bond-r2' },
    } as unknown as AttachmentPointsToBonds;

    const { result } = renderHook(() =>
      useIDTAliasesTextForMonomer({
        idtAliases,
        attachmentPointsToBonds,
      }),
    );

    expect(result.current).toBe('iPos');
  });
});
