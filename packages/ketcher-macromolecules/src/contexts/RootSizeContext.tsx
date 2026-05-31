import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { debounce } from 'lodash';

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
    if (!rootRef?.current) {
      return;
    }

    const { width, height } = rootRef.current.getBoundingClientRect();
    setSize({ width, height });
  }, [rootRef]);

  const debouncedHandleResize = useCallback(debounce(handleResize, 100), [
    handleResize,
  ]);

  useEffect(() => {
    handleResize();
  }, [isMacromoleculesEditorTurnedOn]);

  useEffect(() => {
    debouncedHandleResize();

    window.addEventListener('resize', debouncedHandleResize);

    return () => {
      window.removeEventListener('resize', debouncedHandleResize);
    };
  }, [debouncedHandleResize]);

  return (
    <RootSizeContext.Provider value={size}>{children}</RootSizeContext.Provider>
  );
};
