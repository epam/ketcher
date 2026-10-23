import { FC } from 'react';

export type TabPanelData = {
  caption: string;
  tooltip?: string;
  component: FC<never>;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
