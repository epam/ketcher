import '@testing-library/jest-dom';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { Provider as StoreProvider } from 'react-redux';
import { merge } from 'lodash';

import { configureAppStore, RootState } from 'state';
import { defaultTheme } from 'theming/defaultTheme';

class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
  takeRecords = jest.fn();
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
