declare module 'ketcher-react' {
  import type * as React from 'react';

  export type IconName = string;
  export type PresetPosition = string;

  export const Icon: React.ComponentType<Record<string, unknown>>;
  export const IconButton: React.ComponentType<Record<string, unknown>>;
  export const Button: React.ComponentType<Record<string, unknown>>;
  export const Input: React.ComponentType<Record<string, unknown>>;
  export const Accordion: React.ComponentType<Record<string, unknown>>;
  export const IndigoProvider: {
    getIndigo: () =>
      | {
          info?: () => Promise<{ indigoVersion?: string }>;
        }
      | undefined;
  };
  export const StructRender: React.ComponentType<Record<string, unknown>>;
  export const preview: {
    widthForBond: number;
    heightForBond: number;
  };
  export const AmbiguousMonomerPreview: React.ComponentType<
    Record<string, unknown>
  >;
  export const ArrowScroll: React.ComponentType<Record<string, unknown>>;
  export const EditorClassName: string;
  export const KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR: string;
  export const getFullscreenElement: () => HTMLElement | null;
  export const calculateBondPreviewPosition: (
    bond: unknown,
    bondCoordinates: DOMRect,
  ) => {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    transform?: string;
  };
  export const PresetPosition: string;

  export function usePortalStyle(...args: unknown[]): [React.CSSProperties];
  export function calculateAmbiguousMonomerPreviewTop(
    monomer: unknown,
  ): (target?: { left: number; top: number; bottom: number }) => string;
  export function calculateMonomerPreviewTop(target?: {
    left: number;
    top: number;
    bottom: number;
  }): string;
  export function calculateNucleoElementPreviewTop(target?: {
    left: number;
    top: number;
    bottom: number;
  }): string;
}
