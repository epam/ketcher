import React from 'react';

export const Icon = ({
  children,
  iconName,
  dataTestId,
  testId,
  testid,
  isActive: _isActive,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  iconName?: string;
  dataTestId?: string;
  testId?: string;
  testid?: string;
  isActive?: boolean;
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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  testId?: string;
  testid?: string;
  dataTestId?: string;
  iconName?: string;
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
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  testId?: string;
  testid?: string;
  dataTestId?: string;
  iconName?: string;
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
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;

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
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>;

export const EditorClassName = 'Ketcher-editor';
export const KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR =
  '.Ketcher-polymer-editor-root, .Ketcher-macromolecules-root';

export const getFullscreenElement = () => null;
export const calculateBondPreviewPosition = () => ({} as const);
export const PresetPosition = 'Library';

export const usePortalStyle = () => [{}] as const;
export const calculateAmbiguousMonomerPreviewTop = () => () => '0px';
export const calculateMonomerPreviewTop = () => '0px';
export const calculateNucleoElementPreviewTop = () => '0px';
