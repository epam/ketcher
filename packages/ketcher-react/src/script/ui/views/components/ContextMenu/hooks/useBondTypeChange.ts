import {
  type BondAttributes,
  fromBondsAttrs,
  ketcherProvider,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import tools from '../../../../action/tools';
import type {
  BondsContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

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
      const bondIds = props?.bondIds ?? [];
      const bondProps: Partial<BondAttributes> = {
        ...(toolAction.opts as Partial<BondAttributes>),
      };
      const isCustomQuery = molecule.bonds.get(bondIds[0])?.b.customQuery;
      if (isCustomQuery) {
        bondProps.customQuery = null;
        bondProps.topology = 0;
        bondProps.reactingCenterStatus = 0;
      }
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
