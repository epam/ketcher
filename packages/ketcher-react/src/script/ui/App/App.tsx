/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  BottomToolbarContainer,
  LeftToolbarContainer,
  RightToolbarContainer,
  TopToolbarContainer,
} from '../views/toolbars';
import { useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import AppClipArea from '../views/AppClipArea';
import { AppHiddenContainer } from './AppHidden';
import AppModalContainer from '../views/modal';
import ConnectedEditor from '../views/Editor';
import classes from './App.module.less';
import { initFGroups, initFGTemplates } from '../state/functionalGroups';
import {
  initSaltsAndSolvents,
  initSaltsAndSolventsTemplates,
} from '../state/saltsAndSolvents';
import { useAppContext, useSubscriptionOnEvents } from '../../../hooks';
import { AbbreviationLookupContainer } from '../dialog/AbbreviationLookup';
import { initLib } from '../state/templates/init-lib';
import { ketcherProvider } from 'ketcher-core';
import { useAppDispatch } from '../state/hooks';

interface AppCallProps {
  checkServer: () => void;
  togglerComponent?: JSX.Element;
}

const muiTheme = createTheme({
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

type Props = AppCallProps;

const App = (props: Props) => {
  const dispatch = useAppDispatch();
  const { checkServer } = props;

  useSubscriptionOnEvents();
  const { ketcherId, prevKetcherId } = useAppContext();

  useEffect(() => {
    checkServer();
    // @ts-ignore
    dispatch(initFGTemplates());
    // @ts-ignore
    dispatch(initSaltsAndSolventsTemplates());

    return () => {
      dispatch(initLib([]));
      dispatch(initSaltsAndSolvents([]));
      dispatch(initFGroups([]));
      // App component is unmounted after editor components (MicromoleculeEditor.tsx and ketcher-react/src/Editor.tsx)
      // due to asynchronous behaviour (see packages/ketcher-react/src/MicromoleculesEditor.tsx, appRootRef.current.unmount call).
      // In other hand we still ketcher instance in ketcherProvider for useSubscriptionOnEvents cleanup function.
      // So we need to remove ketcher instance from ketcherProvider here.
      // Ideally is to remove ketcher instance in cleanup function of the most parent component (MicromoleculesEditor, or Editor, depends on usage)
      ketcherProvider.removeKetcherInstance(ketcherId);
    };
  }, []);

  // Temporary workaround: add proper types for Editor
  const Editor = ConnectedEditor as React.ComponentType<{
    className: string;
    ketcherId: string;
    prevKetcherId: string;
  }>;

  return (
    <ThemeProvider theme={muiTheme}>
      <div className={classes.app}>
        <AppHiddenContainer />
        <Editor
          prevKetcherId={prevKetcherId}
          ketcherId={ketcherId}
          className={classes.canvas}
        />

        <TopToolbarContainer
          className={classes.top}
          togglerComponent={props.togglerComponent}
        />
        <LeftToolbarContainer className={classes.left} />
        <BottomToolbarContainer className={classes.bottom} />
        <RightToolbarContainer className={classes.right} />

        <AppClipArea />
        <AppModalContainer ketcherId={ketcherId} />
        <AbbreviationLookupContainer />
      </div>
    </ThemeProvider>
  );
};

export type { AppCallProps };
export { App };
