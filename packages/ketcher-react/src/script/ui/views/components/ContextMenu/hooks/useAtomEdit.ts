import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { mapAtomIdsToAtoms } from 'src/script/editor/tool/select';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import { AtomContextMenuProps, ItemEventParams } from '../contextMenu.types';
import { ketcherProvider } from 'ketcher-core';

type Params = ItemEventParams<AtomContextMenuProps>;

const useAtomEdit = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const atomIds = props?.atomIds || [];
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

  const disabled = useCallback(({ props }: Params) => {
    const atomIds = props?.atomIds;
    if (Array.isArray(atomIds) && atomIds.length !== 0) {
      return false;
    }

    return true;
  }, []);

  return [handler, disabled] as const;
};

export default useAtomEdit;
