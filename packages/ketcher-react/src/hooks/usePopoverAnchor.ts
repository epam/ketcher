import { type MouseEvent, useCallback, useState } from 'react';

export const usePopoverAnchor = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const handleOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return { anchorEl, handleOpen, handleClose };
};
