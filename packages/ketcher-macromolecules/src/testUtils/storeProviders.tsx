import { Provider as StoreProvider } from 'react-redux';
import { configureAppStore, type RootState } from 'state';
import { withThemeProvider } from 'src/testUtils/themeProvider';

export function withStoreProvider(
  component: JSX.Element,
  initialState: RootState = {},
) {
  const store = configureAppStore(initialState);
  return <StoreProvider store={store}>{component}</StoreProvider>;
}

export function withThemeAndStoreProvider(
  component: JSX.Element,
  initialState: RootState = {},
) {
  return withThemeProvider(withStoreProvider(component, initialState));
}
