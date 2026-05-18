import { ElementType } from 'react';

export type TabPanelData = {
  caption: string;
  tooltip?: string;
  component: ElementType;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
