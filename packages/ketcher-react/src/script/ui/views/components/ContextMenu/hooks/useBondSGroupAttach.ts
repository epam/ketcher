import { type ReStruct, ketcherProvider } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import SGroupTool from 'src/script/editor/tool/sgroup';
import type {
  BondsContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

type Params = ItemEventParams<BondsContextMenuProps>;

const getFirstBondId = (props?: BondsContextMenuProps) => props?.bondIds?.[0];

const useBondSGroupAttach = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const struct: ReStruct = editor.render.ctab;
      const bondId = getFirstBondId(props);
      if (bondId === undefined) {
        return;
      }

      const bond = struct.bonds.get(bondId);
      if (!bond) {
        return;
      }

      const selection = {
        atoms: [bond.b.begin, bond.b.end],
        bonds: [bondId],
      };

      editor.selection(selection);
      SGroupTool.sgroupDialog(editor, null);
    },
    [ketcherId],
  );

  const hidden = useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const struct: ReStruct = editor.render.ctab;
      const bondIds = props?.bondIds;

      if (!bondIds || bondIds.length === 0) {
        return true;
      }

      if (bondIds.length > 1) {
        return true;
      }

      const bond = struct.bonds.get(bondIds[0]);
      if (!bond) {
        return true;
      }

      const attachedSGroups = bond.b.getAttachedSGroups(struct.molecule);
      const [sgGroupId] = attachedSGroups;
      const sgroup = struct.sgroups.get(sgGroupId)?.item;
      if (sgroup?.isSuperatomWithoutLabel) {
        return false;
      }
      return attachedSGroups.size > 0;
    },
    [ketcherId],
  );

  return [handler, hidden] as const;
};

export default useBondSGroupAttach;
