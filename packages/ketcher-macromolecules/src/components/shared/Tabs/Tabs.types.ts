import { FC } from 'react';

export type TabPanelData = {
  caption: string;
  tooltip?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: FC<any>;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
