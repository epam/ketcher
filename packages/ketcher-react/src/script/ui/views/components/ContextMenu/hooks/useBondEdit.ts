import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { updateSelectedBonds } from 'src/script/ui/state/modal/bonds';
import { mapBondIdsToBonds } from 'src/script/editor/tool/select';
import { BondsContextMenuProps, ItemEventParams } from '../contextMenu.types';
import { noOperation } from '../utils';
import { KetcherLogger, ketcherProvider } from 'ketcher-core';

type Params = ItemEventParams<BondsContextMenuProps>;

const useBondEdit = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const bondIds = props?.bondIds || [];
      const molecule = editor.render.ctab;
      try {
        const bonds = mapBondIdsToBonds(bondIds, molecule);
        const changeBondPromise = await editor.event.bondEdit.dispatch(bonds);
        updateSelectedBonds({ bonds: bondIds, changeBondPromise, editor });
      } catch (e) {
        KetcherLogger.error('useBondEdit.ts::useBondEdit::handler', e);
        noOperation();
      }
    },
    [ketcherId],
  );

  const disabled = useCallback(({ props }: Params) => {
    const selectedBondIds = props?.bondIds;
    if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
      return false;
    }

    return true;
  }, []);

  return [handler, disabled] as const;
};

export default useBondEdit;
