import { Action, Bond, fromBondsAttrs, KetcherLogger } from 'ketcher-core';
import { updateOnlyChangedProperties } from './utils';

export function updateSelectedBonds({
  bonds,
  changeBondPromise,
  editor,
}: {
  bonds: number[];
  changeBondPromise: Promise<Bond>;
  editor;
}) {
  const action = new Action();
  const struct = editor.render.ctab;
  const { molecule } = struct;
  if (bonds) {
    Promise.resolve(changeBondPromise)
      .then((userChangedBond) => {
        bonds.forEach((bondId) => {
          const unchangedBond = molecule.bonds.get(bondId);
          const bondWithChangedProperties = updateOnlyChangedProperties(
            unchangedBond,
            userChangedBond,
          );
          action.mergeWith(
            fromBondsAttrs(
              struct,
              bondId,
              bondWithChangedProperties as Bond,
              false,
            ),
          );
        });
        editor.update(action);
      })
      .catch(() => {
        KetcherLogger.showExceptionLocation('bonds.ts::updateSelectedBonds');
      });
  }
}
