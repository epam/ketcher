import {
  AttachmentPointName,
  IKetIdtAliases,
  PolymerBond,
  Sugar,
} from 'ketcher-core';
import { useMemo } from 'react';

type Props = {
  idtAliases: IKetIdtAliases | undefined;
  attachmentPointsToBonds?: Record<AttachmentPointName, PolymerBond | null>;
};

const useIDTAliasesTextForMonomer = ({
  idtAliases,
  attachmentPointsToBonds,
}: Props) => {
  return useMemo(() => {
    if (!idtAliases) {
      return null;
    }

    const { base, modifications } = idtAliases;

    // For preview on canvas
    if (attachmentPointsToBonds) {
      if (!modifications) {
        return null;
      }

      const { endpoint5, internal, endpoint3 } = modifications;

      const { R1, R2 } = attachmentPointsToBonds;
      // Handle phosphate exclusively
      if (base === 'Phos') {
        if (R1 !== null && R1.firstMonomer instanceof Sugar) {
          return null;
        }
      }

      if (R1 !== null && R2 === null) {
        return endpoint3 ?? internal;
      } else if (R1 === null && R2 !== null) {
        return endpoint5 ?? internal;
      } else if (R1 !== null && R2 !== null) {
        return internal ?? endpoint5 ?? endpoint3;
      } else {
        return endpoint5 ?? internal ?? endpoint3;
      }
    }

    // For preview in library
    if (!modifications) {
      return base;
    }

    const allModificationsHaveSameBase = Object.values(modifications).every(
      (modification) => modification.includes(base),
    );

    if (allModificationsHaveSameBase) {
      return base;
    }

    const baseToPositionsMap: Record<string, string[]> = {};
    Object.values(modifications).forEach((modification) => {
      const [position, base] = [modification.charAt(0), modification.slice(1)];
      baseToPositionsMap[base] = baseToPositionsMap[base]
        ? [...baseToPositionsMap[base], position]
        : [position];
    });

    return Object.entries(baseToPositionsMap)
      .map(([base, positions]) => {
        return `(${positions.join(', ')})${base}`;
      })
      .join(', ');
  }, [idtAliases, attachmentPointsToBonds]);
};

export default useIDTAliasesTextForMonomer;
