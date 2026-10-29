import { useEffect } from 'react';
import { IndigoProvider } from 'ketcher-react';
import { KetcherLogger } from 'ketcher-core';
import { useAppDispatch } from './stateHooks';
import { setIndigoVersion } from 'state/common/editorSlice';

export function useIndigoVersionToRedux() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchIndigoInfo() {
      const indigo = IndigoProvider.getIndigo();

      if (!indigo?.info) {
        return;
      }

      try {
        const info = await indigo.info();

        dispatch(setIndigoVersion(info.indigoVersion ?? ''));
      } catch (error) {
        KetcherLogger.error(
          'useIndigoVersionToRedux::fetchIndigoInfo - Failed to fetch Indigo version',
          error,
        );
      }
    }

    fetchIndigoInfo();
  }, [dispatch]);
}
