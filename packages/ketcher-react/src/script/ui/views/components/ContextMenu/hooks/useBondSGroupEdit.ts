import { type ReStruct, ketcherProvider, Pile } from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import SGroupTool from 'src/script/editor/tool/sgroup';
import type {
  BondsContextMenuProperties,
  ItemEventParameters,
} from '../contextMenu.types';

type Parameters_ = ItemEventParameters<BondsContextMenuProperties>;

const useBondSGroupEdit = () => {
  const { ketcherId } = useAppContext();
  const sGroupsReference = useRef(new Pile<number>());

  const handler = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const sGroups = Array.from(sGroupsReference.current);
    SGroupTool.sgroupDialog(editor, sGroups[0]);
  }, [ketcherId]);

  // In react-contexify, `disabled` is executed before `hidden`
  const disabled = useCallback(
    ({ props }: Parameters_) => {
      const bondIds = props?.bondIds;
      if (!bondIds) {
        return true;
      }

      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const struct: ReStruct = editor.render.ctab;

      if (bondIds.length > 1) {
        return true;
      }

      const bond = struct.bonds.get(bondIds[0]);
      if (!bond) {
        return true;
      }

      sGroupsReference.current = bond.b.getAttachedSGroups(struct.molecule);

      return sGroupsReference.current.size > 1;
    },
    [ketcherId],
  );

  const hidden = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
    const struct: ReStruct = editor.render.ctab;
    const [sgGroupId] = sGroupsReference.current;
    const sgroup = struct.sgroups.get(sgGroupId)?.item;
    if (sgroup?.isSuperatomWithoutLabel) {
      return true;
    }
    return sGroupsReference.current.size === 0;
  }, [ketcherId]);

  return [handler, disabled, hidden] as const;
};

export default useBondSGroupEdit;
