import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  AtomContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';
import { fromAtomAddition, ketcherProvider, Vec2 } from 'ketcher-core';

type Params = ItemEventParams<AtomContextMenuProps>;

const useSuperAttachmentPointCreate = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const restruct = editor.render.ctab;
      const struct = editor.struct();
      const atomIds = props?.atomIds ?? [];

      const centerOfAtoms = atomIds
        .reduce((acc, id) => {
          const atom = struct.atoms.get(id);
          if (atom) {
            return acc.add(atom.pp);
          }
          return acc;
        }, new Vec2())
        .scaled(1 / atomIds.length);

      const action = fromAtomAddition(restruct, centerOfAtoms, {
        label: '*',
        endpoints: atomIds,
      });

      editor.update(action);
      editor.selection(null);
    },
    [ketcherId],
  );

  // @yulei TODO rewrite logic
  const disabled = useCallback(({ props }: Params) => {
    const atomIds = props?.atomIds;
    if (Array.isArray(atomIds) && atomIds.length !== 0) {
      return false;
    }

    return true;
  }, []);

  return [handler, disabled] as const;
};

export default useSuperAttachmentPointCreate;
