import { vi } from 'vitest';

import React from 'react';

export const contextMenu: { hideAll: () => void } = {
  hideAll: vi.fn(),
};

export const Menu = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

Menu.displayName = 'Menu';

export const Item = ({
  children,
  disabled,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }) => (
  <div
    {...props}
    data-disabled={disabled ? 'true' : undefined}
    className={disabled ? 'disabled' : (props.className ?? '')}
  >
    {children}
  </div>
);

export const Separator = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} />
);

export const Submenu = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;

export const useContextMenu = (): {
  show: () => void;
  hideAll: () => void;
} => ({
  show: vi.fn(),
  hideAll: vi.fn(),
});
