import { FC } from 'react';

export type TabPanelData = {
  caption: string;
  component: FC<any>;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
