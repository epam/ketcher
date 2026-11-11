import { findStereoAtoms, KetcherLogger, ketcherProvider } from 'ketcher-core';
import { useCallback, useRef } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo';
import type {
  AtomContextMenuProperties,
  ItemEventParameters,
} from '../contextMenu.types';
import { noOperation } from '../utils';

type Parameters_ = ItemEventParameters<AtomContextMenuProperties>;

const useAtomStereo = () => {
  const { ketcherId } = useAppContext();
  const stereoAtomIdsReference = useRef<number[] | undefined>(undefined);

  const handler = useCallback(
    async ({ props }: Parameters_) => {
      if (!props || !stereoAtomIdsReference.current) {
        return;
      }

      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

      try {
        const action = await EnhancedStereoTool.changeAtomsStereoAction(
          editor,
          stereoAtomIdsReference.current,
        );

        if (action) {
          editor.update(action);
        }
      } catch (error) {
        KetcherLogger.error('useAtomStereo.ts::useAtomStereo::handler', error);
        noOperation();
      }
    },
    [ketcherId],
  );

  const disabled = useCallback(
    ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const stereoAtomIds: number[] = findStereoAtoms(
        editor.struct(),
        props?.atomIds,
      );
      stereoAtomIdsReference.current = stereoAtomIds;

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
