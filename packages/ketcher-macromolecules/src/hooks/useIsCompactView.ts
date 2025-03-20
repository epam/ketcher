import { useContext } from 'react';
import { RootSizeContext } from '../contexts';

export const useIsCompactView = () => {
  const { width, height } = useContext(RootSizeContext);

  return height < 768 || width < 1024;
};
