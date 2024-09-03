import { findStereoAtoms, KetcherLogger } from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo';
import { AtomContextMenuProps, ItemEventParams } from '../contextMenu.types';
import { noOperation } from '../utils';

type Params = ItemEventParams<AtomContextMenuProps>;

const useAtomStereo = () => {
  const { getKetcherInstance } = useAppContext();
  const stereoAtomIdsRef = useRef<number[] | undefined>();

  const handler = useCallback(
    async ({ props }: Params) => {
      if (!props || !stereoAtomIdsRef.current) {
        return;
      }

      const editor = getKetcherInstance().editor as Editor;

      try {
        const action = await EnhancedStereoTool.changeAtomsStereoAction(
          editor,
          stereoAtomIdsRef.current,
        );

        action && editor.update(action);
      } catch (e) {
        KetcherLogger.error('useAtomStereo.ts::useAtomStereo::handler', e);
        noOperation();
      }
    },
    [getKetcherInstance],
  );

  const disabled = useCallback(
    ({ props }: Params) => {
      const editor = getKetcherInstance().editor as Editor;
      const stereoAtomIds: number[] = findStereoAtoms(
        editor.struct(),
        props?.atomIds,
      );
      stereoAtomIdsRef.current = stereoAtomIds;

      if (Array.isArray(stereoAtomIds) && stereoAtomIds.length !== 0) {
        return false;
      }

      return true;
    },
    [getKetcherInstance],
  );

  return [handler, disabled] as const;
};

export default useAtomStereo;
