import { useContext } from 'react';
import { RootSizeContext } from '../contexts';

export const useIsCompactView = () => {
  const { width } = useContext(RootSizeContext);

  return width < 1024;
};
