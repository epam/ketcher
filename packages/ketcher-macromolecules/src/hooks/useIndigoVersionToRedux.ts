import { useEffect } from 'react';
import { IndigoProvider } from 'ketcher-react';
import { useAppDispatch, useAppSelector } from './stateHooks';
import { setAppMeta, selectAppMeta } from 'state/common/editorSlice';

export function useIndigoVersionToRedux() {
  const dispatch = useAppDispatch();
  const app = useAppSelector(selectAppMeta);

  useEffect(() => {
    async function fetchIndigoInfo() {
      const indigo = IndigoProvider.getIndigo();
      if (indigo && indigo.info) {
        try {
          const info = await indigo.info();
          dispatch(
            setAppMeta({
              ...app,
              indigoVersion: info.indigoVersion || '',
            }),
          );
        } catch (e) {
          // ignore
        }
      }
    }
    fetchIndigoInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
}
