declare module 'ketcher-react' {
  import type * as React from 'react';
  import type { i18n as I18nInstance } from 'i18next';

  export type IconName = string;
  export type PresetPosition = string;

  export const i18n: I18nInstance;

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

  // Shared Settings window, mounted here over SettingsService
  export interface SettingsGroup {
    key: string;
    label: string;
    content: React.ReactNode;
  }

  export interface SettingsPanelProps {
    title: string;
    headerControls?: React.ReactNode;
    groups?: SettingsGroup[];
    children?: React.ReactNode;
    boundsElement?: HTMLElement | null;
    isApplyDisabled?: boolean;
    onApply: () => void;
    onCancel: () => void;
    onClose: () => void;
    className?: string;
  }
  export const SettingsPanel: React.ComponentType<SettingsPanelProps>;

  export interface SettingsAccordionProps {
    groups: SettingsGroup[];
    defaultExpandedGroups?: string[];
    className?: string;
  }
  export const SettingsAccordion: React.ComponentType<SettingsAccordionProps>;

  export type SettingsFieldLayout = 'toggle' | 'measure' | 'select' | 'color';

  export interface SettingsFieldRowProps {
    label: string;
    layout: SettingsFieldLayout;
    hint?: string;
    children: React.ReactNode;
    className?: string;
    testId?: string;
  }
  export const SettingsFieldRow: React.ComponentType<SettingsFieldRowProps>;

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
