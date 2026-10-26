import { renderHook } from '@testing-library/react';
import useIDTAliasesTextForMonomer from './useIDTAliasesTextForMonomer';

describe('useIDTAliasesTextForMonomer', () => {
  it.each(['constructor', 'toString', '__proto__', ''])(
    'groups modification positions with base %p',
    (base) => {
      const { result } = renderHook(() =>
        useIDTAliasesTextForMonomer({
          idtAliases: {
            base: 'unused',
            modifications: {
              endpoint5: `5${base}`,
              internal: `i${base}`,
              endpoint3: `3${base}`,
            },
          },
          attachmentPointsToBonds: undefined,
        }),
      );

      expect(result.current).toBe(`(5, i, 3)${base}`);
    },
  );
});
