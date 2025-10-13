import { ketcherProvider, Pile, ReStruct } from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import SGroupTool from 'src/script/editor/tool/sgroup';
import { BondsContextMenuProps, ItemEventParams } from '../contextMenu.types';

type Params = ItemEventParams<BondsContextMenuProps>;

const useBondSGroupEdit = () => {
  const { ketcherId } = useAppContext();
  const sGroupsRef = useRef(new Pile<number>());

  const handler = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const sGroups = Array.from(sGroupsRef.current);
    SGroupTool.sgroupDialog(editor, sGroups[0]);
  }, [ketcherId]);

  // In react-contexify, `disabled` is executed before `hidden`
  const disabled = useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const struct: ReStruct = editor.render.ctab;
      const bondIds = props!.bondIds!;

      if (bondIds.length > 1) {
        return true;
      }

      const bond = struct.bonds.get(bondIds[0])!;
      sGroupsRef.current = bond.b.getAttachedSGroups(struct.molecule);

      return sGroupsRef.current.size > 1;
    },
    [ketcherId],
  );

  const hidden = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const struct: ReStruct = editor.render.ctab;
    const [sgGroupId] = sGroupsRef.current;
    const sgroup = struct.sgroups.get(sgGroupId)?.item;
    if (sgroup?.isSuperatomWithoutLabel) {
      return true;
    }
    // Hide Edit S-Group for molecules with connection points (attachment points)
    if (sgroup?.isGroupAttached(struct.molecule)) {
      return true;
    }
    return sGroupsRef.current.size === 0;
  }, [ketcherId]);

  return [handler, disabled, hidden] as const;
};

export default useBondSGroupEdit;
