import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useState,
  useMemo
} from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

export const RootSizeContext = createContext({ width: 0, height: 0 });

type Props = {
  children: ReactNode;
  rootRef: RefObject<HTMLElement> | null;
  isMacromoleculesEditorTurnedOn?: boolean;
};

export const RootSizeProvider = ({
  children,
  rootRef,
  isMacromoleculesEditorTurnedOn,
}: Props) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    const rootElement = rootRef?.current;

    if (!rootElement) {
      return;
    }

    const { width, height } = rootElement.getBoundingClientRect();
    setSize({ width, height });
  }, [rootRef]);

  const debouncedHandleResize = useMemo(
    () => debounce(handleResize, 100),
    [handleResize],
  );

  useEffect(() => {
  return () => {
    debouncedHandleResize.cancel();
  };
}, [debouncedHandleResize]);

  useEffect(() => {
    handleResize();
  }, [handleResize, isMacromoleculesEditorTurnedOn]);

  useEffect(() => {
    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
      debouncedHandleResize.cancel();
    };
  }, [debouncedHandleResize]);

  return (
    <RootSizeContext.Provider value={size}>{children}</RootSizeContext.Provider>
  );
};
