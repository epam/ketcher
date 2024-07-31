import { IKetIdtAliases } from 'ketcher-core';
import { useMemo } from 'react';
import { PresetPosition } from 'state/common';

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

    if (presetName.includes('MOE')) {
      const { base, modifications } = idtAliases;

      const endpoint5 = modifications?.endpoint5 ?? `5${base}`;
      const internal = modifications?.internal ?? `i${base}`;
      const endpoint3 = modifications?.endpoint3 ?? `3${base}`;

      switch (position) {
        case PresetPosition.Library:
          return `${endpoint5}, ${internal}`;
        case PresetPosition.ChainStart:
          return endpoint5;
        case PresetPosition.ChainMiddle:
          return internal;
        case PresetPosition.ChainEnd:
          return endpoint3;
      }
    }

    return idtAliases.base;
  }, [presetName, position, idtAliases]);
};

export default useIDTAliasesTextForPreset;
