import { FC } from 'react';

export type TabComponent = FC<Record<string, unknown>>;

export type TabPanelData = {
  caption: string;
  tooltip?: string;
  component: TabComponent;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
