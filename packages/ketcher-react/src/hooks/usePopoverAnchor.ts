import { type MouseEvent, useCallback, useState } from 'react';

export const usePopoverAnchor = () => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const handleOpen = useCallback((event: MouseEvent<HTMLElement>) => {
    setAnchorElement(event.currentTarget);
  }, []);
  const handleClose = useCallback(() => {
    setAnchorElement(null);
  }, []);

  return { anchorEl: anchorElement, handleOpen, handleClose };
};
