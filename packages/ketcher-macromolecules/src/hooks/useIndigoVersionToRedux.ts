import { useEffect } from 'react';
import { IndigoProvider } from 'ketcher-react';
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
      } catch (_e) {
        // ignore
      }
    }

    fetchIndigoInfo();
  }, [dispatch]);
}
