import { vi } from 'vitest';

import '@testing-library/jest-dom/vitest';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@emotion/react';
import { Provider as StoreProvider } from 'react-redux';
import { merge } from 'lodash';

import { configureAppStore, RootState } from 'state';
import { defaultTheme } from 'theming/defaultTheme';

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
const muiTheme = createTheme();
const mergedTheme = merge(muiTheme, { ketcher: defaultTheme });

// Type declarations for global functions are in typings.d.ts
global.withThemeProvider = function (component: JSX.Element) {
  return <ThemeProvider theme={mergedTheme}>{component}</ThemeProvider>;
};

global.withStoreProvider = function (
  component: JSX.Element,
  initialState: RootState = {},
) {
  const store = configureAppStore(initialState);
  return <StoreProvider store={store}>{component}</StoreProvider>;
};

global.withThemeAndStoreProvider = function (
  component: JSX.Element,
  initialState: RootState = {},
) {
  const store = configureAppStore(initialState);
  return (
    <ThemeProvider theme={mergedTheme}>
      <StoreProvider store={store}>{component}</StoreProvider>
    </ThemeProvider>
  );
};
