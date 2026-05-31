import { findStereoAtoms, KetcherLogger, ketcherProvider } from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo';
import { AtomContextMenuProps, ItemEventParams } from '../contextMenu.types';
import { noOperation } from '../utils';

type Params = ItemEventParams<AtomContextMenuProps>;

const useAtomStereo = () => {
  const { ketcherId } = useAppContext();
  const stereoAtomIdsRef = useRef<number[] | undefined>(undefined);

  const handler = useCallback(
    async ({ props }: Params) => {
      if (!props || !stereoAtomIdsRef.current) {
        return;
      }

      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

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
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
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
    [ketcherId],
  );

  return [handler, disabled] as const;
};

export default useAtomStereo;
