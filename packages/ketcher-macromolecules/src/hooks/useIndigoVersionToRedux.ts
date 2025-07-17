import { useEffect } from 'react';
import { IndigoProvider } from 'ketcher-react';
import { useDispatch, useSelector } from 'react-redux';
import { setAppMeta } from 'state/common/editorSlice';
import type { RootState } from 'state';

export function useIndigoVersionToRedux() {
  const dispatch = useDispatch();
  const app = useSelector((state: RootState) => state.editor?.app || {});

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
