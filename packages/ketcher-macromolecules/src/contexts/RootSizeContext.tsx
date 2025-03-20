import {
  createContext,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';

export const RootSizeContext = createContext({ width: 0, height: 0 });

type Props = {
  children: ReactNode;
  rootRef: RefObject<HTMLElement> | null;
};

export const RootSizeProvider = ({ children, rootRef }: Props) => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (!rootRef?.current) {
      return;
    }

    const { width, height } = rootRef.current.getBoundingClientRect();
    setSize({ width, height });
  }, [rootRef]);

  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  return (
    <RootSizeContext.Provider value={size}>{children}</RootSizeContext.Provider>
  );
};
