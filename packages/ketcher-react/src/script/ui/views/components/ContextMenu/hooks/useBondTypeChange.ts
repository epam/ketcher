import {
  type BondAttributes,
  fromBondsAttrs,
  ketcherProvider,
  bondChangingAction,
  isBondFlipRequested,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import tools from '../../../../action/tools';
import type {
  BondsContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';
import { getEditableBondIds } from '../utils';

type Params = ItemEventParams<BondsContextMenuProps>;

const useBondTypeChange = () => {
  const { ketcherId } = useAppContext();
  const handler = useCallback(
    ({ id, props }: Params) => {
      if (id == null) return;
      const toolAction = tools[id]?.action;
      if (!toolAction || typeof toolAction === 'function') return;

      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const bondIds = getEditableBondIds(editor.struct(), props?.bondIds ?? []);
      if (bondIds.length === 0) return;

      const bondProps: Partial<BondAttributes> = {
        ...(toolAction.opts as Partial<BondAttributes>),
      };
      const isCustomQuery = molecule.bonds.get(bondIds[0])?.b.customQuery;
      if (isCustomQuery) {
        bondProps.customQuery = null;
        bondProps.topology = 0;
        bondProps.reactingCenterStatus = 0;
      }

      // Choosing the type a single stereo or dative bond already has reverses
      // its direction (#4188). Any other choice sets exactly the chosen type:
      // the bond tool's cycling (Single -> Double -> Triple) does not apply here
      const bond = molecule.bonds.get(bondIds[0])?.b;
      if (
        bondIds.length === 1 &&
        bond &&
        isBondFlipRequested(bond, bondProps)
      ) {
        editor.update(
          bondChangingAction(molecule, bondIds[0], bond, bondProps),
        );
        return;
      }

      editor.update(fromBondsAttrs(molecule, bondIds, bondProps));
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Params) => {
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
