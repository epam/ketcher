import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import { mapAtomIdsToAtoms } from 'src/script/editor/tool/select';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import type {
  AtomContextMenuProperties,
  ItemEventParameters,
} from '../contextMenu.types';
import { ketcherProvider } from 'ketcher-core';
import { getEditableAtomIds } from '../utils';

type Parameters_ = ItemEventParameters<AtomContextMenuProperties>;

const useAtomEdit = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const atomIds = getEditableAtomIds(editor.struct(), props?.atomIds ?? []);
      if (atomIds.length === 0) return;

      const atoms = mapAtomIdsToAtoms(atomIds, molecule);

      const newAtom = editor.event.elementEdit.dispatch(atoms);

      updateSelectedAtoms({
        atoms: atomIds,
        changeAtomPromise: newAtom,
        editor,
      });
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      return (
        getEditableAtomIds(editor.struct(), props?.atomIds ?? []).length === 0
      );
    },
    [ketcherId],
  );

  return [handler, disabled] as const;
};

export default useAtomEdit;
