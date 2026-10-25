import { type MouseEvent, useCallback, useState } from 'react';

export const usePopoverAnchor = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>(undefined);
  const handleOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(undefined);
  }, []);

  return { anchorEl, handleOpen, handleClose };
};
