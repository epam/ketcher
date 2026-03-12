import { FC } from 'react';

export type TabComponent = FC<Record<string, unknown>>;

export const toTabComponent = <T>(component: FC<T>): TabComponent =>
  component as unknown as TabComponent;

export type TabPanelData = {
  caption: string;
  tooltip?: string;
  component: TabComponent;
  testId: string;
  props?: Record<string, unknown>;
};

export type TabsData = TabPanelData[];
