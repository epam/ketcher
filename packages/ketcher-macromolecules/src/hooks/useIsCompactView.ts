import { useContext } from 'react';
import { RootSizeContext } from '../contexts';

export const useIsCompactView = () => {
  const { height } = useContext(RootSizeContext);

  return height < 720;
};
