import { Pile, ReStruct } from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import SGroupTool from 'src/script/editor/tool/sgroup';
import { ItemEventParams } from '../contextMenu.types';

const useBondSGroupEdit = () => {
  const { getKetcherInstance } = useAppContext();
  const sGroupsRef = useRef(new Pile<number>());

  const handler = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor;
    const sGroups = Array.from(sGroupsRef.current);
    SGroupTool.sgroupDialog(editor, sGroups[0]);
  }, [getKetcherInstance]);

  // In react-contexify, `disabled` is executed before `hidden`
  const disabled = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const struct: ReStruct = editor.render.ctab;
      const bondIds = props!.bondIds!;

      if (bondIds.length > 1) {
        return true;
      }

      const bond = struct.bonds.get(bondIds[0])!;
      sGroupsRef.current = bond.b.getAttachedSGroups(struct.molecule);

      return sGroupsRef.current.size > 1;
    },
    [getKetcherInstance]
  );

  const hidden = useCallback(() => {
    return sGroupsRef.current.size === 0;
  }, []);

  return [handler, disabled, hidden] as const;
};

export default useBondSGroupEdit;
