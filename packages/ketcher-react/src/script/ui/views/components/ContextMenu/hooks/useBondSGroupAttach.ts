import { ketcherProvider, ReStruct } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import SGroupTool from 'src/script/editor/tool/sgroup';
import { BondsContextMenuProps, ItemEventParams } from '../contextMenu.types';

type Params = ItemEventParams<BondsContextMenuProps>;

const useBondSGroupAttach = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const struct: ReStruct = editor.render.ctab;
      const bondId = props!.bondIds![0];
      const bond = struct.bonds.get(bondId)!;

      const selection = {
        atoms: [bond?.b.begin, bond?.b.end],
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
      const bondIds = props!.bondIds!;

      if (bondIds.length > 1) {
        return true;
      }

      const bond = struct.bonds.get(bondIds[0])!;
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
