import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  AtomContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';
import { fromAtomAddition, ketcherProvider, Vec2 } from 'ketcher-core';
import {
  isSuperAttachmentPointCreationSelectionValid,
  isSuperAttachmentPointCreationSelectionVisible,
} from '../utils';

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

      const endpointsFragment = struct.atoms.get(atomIds[0])?.fragment ?? null;

      const action = fromAtomAddition(
        restruct,
        centerOfAtoms,
        {
          label: '*',
          endpoints: atomIds,
        },
        endpointsFragment,
      );

      editor.update(action);
      editor.selection(null);
    },
    [ketcherId],
  );

  const isVisible = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

    return isSuperAttachmentPointCreationSelectionVisible(
      editor.struct(),
      editor.selection(),
    );
  }, [ketcherId]);

  const isDisabled = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

    return !isSuperAttachmentPointCreationSelectionValid(
      editor.struct(),
      editor.selection(),
    );
  }, [ketcherId]);

  return { handler, isVisible, isDisabled };
};

export default useSuperAttachmentPointCreate;
