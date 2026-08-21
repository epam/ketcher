import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

export const RootSizeContext = createContext({ width: 0, height: 0 });

type Props = {
  children: ReactNode;
  rootRef: RefObject<HTMLElement> | null;
};

export const RootSizeProvider = ({ children, rootRef }: Props) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    const rootElement = rootRef?.current;

    if (!rootElement) {
      return;
    }

    const { width, height } = rootElement.getBoundingClientRect();
    setSize({ width, height });
  }, [rootRef]);

  const debouncedHandleResize = useDebouncedCallback(handleResize, 100);

  useEffect(() => {
    const rootElement = rootRef?.current;

    if (!rootElement) {
      return;
    }

    const resizeObserver = new ResizeObserver(debouncedHandleResize);

    handleResize();
    resizeObserver.observe(rootElement);

    return () => {
      resizeObserver.disconnect();
      debouncedHandleResize.cancel();
    };
  }, [debouncedHandleResize, handleResize, rootRef]);

  return (
    <RootSizeContext.Provider value={size}>{children}</RootSizeContext.Provider>
  );
};
