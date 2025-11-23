import { AttachmentPointsToBonds, IKetIdtAliases } from 'ketcher-core';
import { useMemo } from 'react';

import { removeSlashesFromIdtAlias } from 'helpers';

type Props = {
  idtAliases: IKetIdtAliases | undefined;
  attachmentPointsToBonds: AttachmentPointsToBonds | undefined;
  monomerClass?: string | undefined;
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

    if (!modifications) {
      return removeSlashesFromIdtAlias(base);
    }
    const { endpoint5, internal, endpoint3 } = modifications;

    // For preview on canvas
    if (attachmentPointsToBonds) {
      const { R1, R2 } = attachmentPointsToBonds;

      if (R1 !== null && R2 === null) {
        return removeSlashesFromIdtAlias(endpoint3 ?? internal);
      } else if (R1 === null && R2 !== null) {
        return removeSlashesFromIdtAlias(endpoint5 ?? internal);
      } else if (R1 !== null && R2 !== null) {
        return removeSlashesFromIdtAlias(internal ?? endpoint5 ?? endpoint3);
      } else {
        return removeSlashesFromIdtAlias(endpoint5 ?? internal ?? endpoint3);
      }
    }

    // For preview in library

    const allModificationsHaveSameBase = Object.values(modifications).every(
      (modification) => modification.includes(base),
    );

    if (endpoint3 && endpoint5 && internal && allModificationsHaveSameBase) {
      return removeSlashesFromIdtAlias(base);
    }

    const baseToPositionsMap: Record<string, string[]> = {};
    Object.values(modifications).forEach((modification) => {
      const cleanModification = removeSlashesFromIdtAlias(modification) ?? '';
      const [position, base] = [
        cleanModification.charAt(0),
        cleanModification.slice(1),
      ];
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
