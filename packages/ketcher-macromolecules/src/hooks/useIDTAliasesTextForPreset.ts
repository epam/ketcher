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
      const { modifications } = idtAliases;

      if (!modifications) {
        return;
      }

      switch (position) {
        case 'library':
          return `${modifications?.endpoint5}, ${modifications?.internal}`;
        case 'chainStart':
          return modifications?.endpoint5;
        case 'chainMiddle':
          return modifications?.internal;
        case 'chainEnd':
          return modifications?.endpoint3;
      }
    }

    return idtAliases.base;
  }, [presetName, position, idtAliases]);
};

export default useIDTAliasesTextForPreset;
