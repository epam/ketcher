import {
  FunctionalGroup,
  type ReStruct,
  fromSgroupDeletion,
  ketcherProvider,
  Pile,
} from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  BondsContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

type Params = ItemEventParams<BondsContextMenuProps>;

const useBondSGroupRemove = () => {
  const { ketcherId } = useAppContext();
  const sGroupsRef = useRef(new Pile<number>());

  const getEditor = useCallback(
    () => ketcherProvider.getKetcher(ketcherId).editor as Editor,
    [ketcherId],
  );

  const handler = useCallback(() => {
    const [sGroupId] = sGroupsRef.current;
    if (sGroupId === undefined) {
      return;
    }

    const editor = getEditor();
    editor.update(fromSgroupDeletion(editor.render.ctab, sGroupId));
    editor.selection(null);
    editor.focusCliparea();
  }, [getEditor]);

  // In react-contexify, `disabled` is executed before `hidden`
  const disabled = useCallback(
    ({ props }: Params) => {
      sGroupsRef.current = new Pile<number>();
      const bondIds = props?.bondIds;
      if (!bondIds || bondIds.length !== 1) {
        return true;
      }

      const editor = getEditor();
      const struct: ReStruct = editor.render.ctab;
      const bond = struct.bonds.get(bondIds[0]);
      if (!bond) {
        return true;
      }

      sGroupsRef.current = bond.b.getAttachedSGroups(struct.molecule);

      return (
        sGroupsRef.current.size > 1 || editor.isMonomerCreationWizardActive
      );
    },
    [getEditor],
  );

  const hidden = useCallback(() => {
    const [sGroupId] = sGroupsRef.current;
    if (sGroupId === undefined) {
      return true;
    }

    const struct: ReStruct = getEditor().render.ctab;
    const sGroup = struct.sgroups.get(sGroupId)?.item;
    if (!sGroup) {
      return true;
    }

    return (
      sGroup.isSuperatomWithoutLabel ||
      sGroup.isMonomer ||
      FunctionalGroup.isFunctionalGroup(sGroup)
    );
  }, [getEditor]);

  return [handler, disabled, hidden] as const;
};

export default useBondSGroupRemove;
