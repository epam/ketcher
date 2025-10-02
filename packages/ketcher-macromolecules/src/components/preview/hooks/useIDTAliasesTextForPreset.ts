import { IKetIdtAliases } from 'ketcher-core';
import { useMemo } from 'react';

import { PresetPosition } from 'state';

type Props = {
  presetName: string | undefined;
  position: PresetPosition;
  idtAliases: IKetIdtAliases | undefined;
};

const useIDTAliasesTextForPreset = ({
  presetName,
  position,
  idtAliases,
}: Props) => {
  return useMemo(() => {
    if (!presetName || !idtAliases) {
      return null;
    }

    const { base, modifications } = idtAliases;

    if (!modifications) {
      return base;
    }
    const { endpoint5, internal, endpoint3 } = modifications;

    const baseToPositionsMap: Record<string, string[]> = {};
    Object.values(modifications).forEach((modification) => {
      const [position, base] = [modification.charAt(0), modification.slice(1)];
      baseToPositionsMap[base] = baseToPositionsMap[base]
        ? [...baseToPositionsMap[base], position]
        : [position];
    });
    switch (position) {
      case PresetPosition.Library:
        if (endpoint3 && endpoint5 && internal) {
          return base;
        }
        return Object.entries(baseToPositionsMap)
          .map(([base, positions]) => {
            return `(${positions.join(', ')})${base}`;
          })
          .join(', ');
      case PresetPosition.ChainStart:
        return endpoint5;
      case PresetPosition.ChainMiddle:
        return internal;
      case PresetPosition.ChainEnd:
        return endpoint3;
    }
  }, [presetName, position, idtAliases]);
};

export default useIDTAliasesTextForPreset;
