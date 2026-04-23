import { FC } from 'react';

export type TabPanelData<
  P extends Record<string, unknown> = Record<string, unknown>,
> = {
  caption: string;
  tooltip?: string;
  component: FC<P>;
  testId: string;
  props?: P;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TabsData = TabPanelData<any>[];
