import { ComponentType } from 'react';

export type TabPanelData = {
  caption: string;
  tooltip?: string;
  component: ComponentType<never>;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
