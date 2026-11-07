import {
  type BondAttributes,
  fromBondsAttrs,
  ketcherProvider,
  bondChangingAction,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import tools from '../../../../action/tools';
import type {
  BondsContextMenuProperties,
  ItemEventParameters,
} from '../contextMenu.types';
import { getEditableBondIds } from '../utils';

type Parameters_ = ItemEventParameters<BondsContextMenuProperties>;

const useBondTypeChange = () => {
  const { ketcherId } = useAppContext();
  const handler = useCallback(
    ({ id, props }: Parameters_) => {
      if (id == null) return;
      const toolAction = tools[id]?.action;
      if (!toolAction || typeof toolAction === 'function') return;

      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const bondIds = getEditableBondIds(editor.struct(), props?.bondIds ?? []);
      if (bondIds.length === 0) return;

      const bondProperties: Partial<BondAttributes> = {
        ...(toolAction.opts as Partial<BondAttributes>),
      };
      const isCustomQuery = molecule.bonds.get(bondIds[0])?.b.customQuery;
      if (isCustomQuery) {
        bondProperties.customQuery = null;
        bondProperties.topology = 0;
        bondProperties.reactingCenterStatus = 0;
      }

      // If only one bond is selected, use bondChangingAction to support direction flipping
      if (bondIds.length === 1) {
        const bond = molecule.bonds.get(bondIds[0]);
        if (bond) {
          const action = bondChangingAction(
            molecule,
            bondIds[0],
            bond.b,
            bondProperties,
          );
          editor.update(action);
          return;
        }
      }

      // For multiple bonds, use fromBondsAttrs
      editor.update(fromBondsAttrs(molecule, bondIds, bondProperties));
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor;
      const selectedBondIds = getEditableBondIds(
        editor.struct(),
        props?.bondIds ?? [],
      );

      if (selectedBondIds.length !== 0) {
        return editor.struct().isBondFromMacromolecule(selectedBondIds[0]);
      }
      return true;
    },
    [ketcherId],
  );

  return [handler, disabled] as const;
};

export default useBondTypeChange;
