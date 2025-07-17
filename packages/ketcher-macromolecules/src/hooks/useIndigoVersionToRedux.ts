import { useEffect } from 'react';
import { IndigoProvider } from 'ketcher-react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from './stateHooks';
import { setAppMeta } from 'state/common/editorSlice';

export function useIndigoVersionToRedux() {
  const dispatch = useDispatch();
  const app = useAppSelector((state) => state.editor?.app || {});

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
