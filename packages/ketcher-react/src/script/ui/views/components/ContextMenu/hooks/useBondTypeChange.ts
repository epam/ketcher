import {
  fromBondsAttrs,
  ketcherProvider,
  bondChangingAction,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import tools from '../../../../action/tools';
import { BondsContextMenuProps, ItemEventParams } from '../contextMenu.types';

type Params = ItemEventParams<BondsContextMenuProps>;

const useBondTypeChange = () => {
  const { ketcherId } = useAppContext();
  const handler = useCallback(
    ({ id, props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const bondIds = props?.bondIds || [];
      const bondProps = { ...tools[id].action.opts };
      const isCustomQuery = molecule.bonds.get(bondIds[0])?.b.customQuery;
      if (isCustomQuery) {
        bondProps.customQuery = null;
        bondProps.topology = 0;
        bondProps.reactingCenterStatus = 0;
      }

      // If only one bond is selected, use bondChangingAction to support direction flipping
      if (bondIds.length === 1) {
        const bond = molecule.bonds.get(bondIds[0]);
        if (bond) {
          const action = bondChangingAction(
            molecule,
            bondIds[0],
            bond.b,
            bondProps,
          );
          editor.update(action);
          return;
        }
      }

      // For multiple bonds, use fromBondsAttrs
      editor.update(fromBondsAttrs(molecule, bondIds, bondProps));
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Params) => {
      const selectedBondIds = props?.bondIds;
      const editor = ketcherProvider.getKetcher(ketcherId).editor;

      if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
        return editor.struct().isBondFromMacromolecule(selectedBondIds[0]);
      }
      return true;
    },
    [ketcherId],
  );

  return [handler, disabled] as const;
};

export default useBondTypeChange;
