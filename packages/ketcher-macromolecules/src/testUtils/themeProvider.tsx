import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { merge } from 'lodash';
import { defaultTheme } from 'theming/defaultTheme';

const mergedTheme = merge(createTheme(), { ketcher: defaultTheme });

export function withThemeProvider(component: JSX.Element) {
  return <ThemeProvider theme={mergedTheme}>{component}</ThemeProvider>;
}
