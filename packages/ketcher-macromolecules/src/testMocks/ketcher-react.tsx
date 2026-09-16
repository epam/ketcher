import React from 'react';

export const Icon = ({
  children,
  iconName,
  dataTestId,
  testId,
  testid,
  isActive: _isActive,
  expanded: _expanded,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  iconName?: string;
  dataTestId?: string;
  testId?: string;
  testid?: string;
  isActive?: boolean;
  expanded?: boolean;
}) => {
  const svgProps = {
    ...props,
    ...(iconName ? { name: iconName } : {}),
    ...(dataTestId ? { 'data-testid': dataTestId } : {}),
    ...(testId ? { 'data-testid': testId } : {}),
    ...(testid ? { 'data-testid': testid } : {}),
  };

  return <svg {...svgProps}>{children}</svg>;
};

export const IconButton = ({
  children,
  testId,
  testid,
  dataTestId,
  iconName: _iconName,
  isActive: _isActive,
  primary: _primary,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  testId?: string;
  testid?: string;
  dataTestId?: string;
  iconName?: string;
  isActive?: boolean;
  primary?: boolean;
}) => (
  <button
    type="button"
    {...props}
    {...(testId ? { 'data-testid': testId } : {})}
    {...(testid ? { 'data-testid': testid } : {})}
    {...(dataTestId ? { 'data-testid': dataTestId } : {})}
  >
    {children}
  </button>
);

export const Button = ({
  children,
  testId,
  testid,
  dataTestId,
  iconName: _iconName,
  isActive: _isActive,
  primary: _primary,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  testId?: string;
  testid?: string;
  dataTestId?: string;
  iconName?: string;
  isActive?: boolean;
  primary?: boolean;
}) => (
  <button
    type="button"
    {...props}
    {...(testId ? { 'data-testid': testId } : {})}
    {...(testid ? { 'data-testid': testid } : {})}
    {...(dataTestId ? { 'data-testid': dataTestId } : {})}
  >
    {children}
  </button>
);

export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} />
);

export const Accordion = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) => <div {...props}>{children}</div>;

export const IndigoProvider = {
  getIndigo: () => undefined,
};

export const StructRender = ({
  children,
  struct: _struct,
  options: _options,
  update: _update,
  isExpanded: _isExpanded,
  testId,
  testid,
  dataTestId,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  struct?: unknown;
  options?: unknown;
  update?: unknown;
  isExpanded?: boolean;
  testId?: string;
  testid?: string;
  dataTestId?: string;
}) => (
  <div
    {...props}
    {...(testId ? { 'data-testid': testId } : {})}
    {...(testid ? { 'data-testid': testid } : {})}
    {...(dataTestId ? { 'data-testid': dataTestId } : {})}
  >
    {children}
  </div>
);

export const preview = {
  widthForBond: 358,
  heightForBond: 268,
};

export const AmbiguousMonomerPreview = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;

export const ArrowScroll = ({
  children,
  startInView: _startInView,
  endInView: _endInView,
  scrollForward: _scrollForward,
  scrollBack: _scrollBack,
  isLeftRight: _isLeftRight,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  startInView?: boolean;
  endInView?: boolean;
  scrollForward?: (dtMs: number) => void;
  scrollBack?: (dtMs: number) => void;
  isLeftRight?: boolean;
}) => <div {...props}>{children}</div>;

export const EditorClassName = 'Ketcher-editor';
export const KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR =
  '.Ketcher-polymer-editor-root, .Ketcher-macromolecules-root';

export const getFullscreenElement = () => null;
export const calculateBondPreviewPosition = () => ({}) as const;
export const PresetPosition = 'Library';

export const usePortalStyle = () => [{}] as const;
export const calculateAmbiguousMonomerPreviewTop = () => () => '0px';
export const calculateMonomerPreviewTop = () => '0px';
export const calculateNucleoElementPreviewTop = () => '0px';
