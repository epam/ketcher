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
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { useSubscriptionOnEvents } from '../../../hooks';
import { AbbreviationLookupContainer } from '../dialog/AbbreviationLookup';
import { initLib } from '../state/templates/init-lib';
import { ketcherProvider } from 'ketcher-core';
import { InfoModal } from 'ketcher-react';
import {
  KETCHER_INIT_EVENT_NAME,
  GLOBAL_ERROR_HANDLER,
} from '../../../constants';

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
  const dispatch = useDispatch();
  const { checkServer } = props;

  useSubscriptionOnEvents();

  useEffect(() => {
    checkServer();
    dispatch(initFGTemplates());
    dispatch(initSaltsAndSolventsTemplates());
    window.scrollTo(0, 0);
    return () => {
      dispatch(initLib([]));
      dispatch(initSaltsAndSolvents([]));
      dispatch(initFGroups([]));
    };
  }, []);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleError = (message: string) => {
    const ketcher = ketcherProvider.getKetcher();
    console.log('handleError error', ketcher.eventBus);
    setHasError(true);
    setErrorMessage(message);
  };

  const subscribeOnInit = () => {
    const ketcher = ketcherProvider.getKetcher();
    ketcher.eventBus.addListener(GLOBAL_ERROR_HANDLER, handleError);
  };

  const unsubscribeOnDestroy = () => {
    const ketcher = ketcherProvider.getKetcher();
    ketcher.eventBus.removeListener(GLOBAL_ERROR_HANDLER, handleError);
  };

  useEffect(() => {
    window.addEventListener(KETCHER_INIT_EVENT_NAME, subscribeOnInit);

    return () => {
      console.log('unsubscribe');
      unsubscribeOnDestroy();
      window.removeEventListener(KETCHER_INIT_EVENT_NAME, subscribeOnInit);
    };
  }, []);

  // Temporary workaround: add proper types for Editor
  const Editor = ConnectedEditor as React.ComponentType<{ className: string }>;

  return (
    <ThemeProvider theme={muiTheme}>
      <>
        <div className={classes.app}>
          <AppHiddenContainer />
          <Editor className={classes.canvas} />

          <TopToolbarContainer
            className={classes.top}
            togglerComponent={props.togglerComponent}
          />
          <LeftToolbarContainer className={classes.left} />
          <BottomToolbarContainer className={classes.bottom} />
          <RightToolbarContainer className={classes.right} />

          <AppClipArea />
          <AppModalContainer />
          <AbbreviationLookupContainer />
        </div>
        {hasError && (
          <InfoModal
            message={errorMessage}
            close={() => {
              setHasError(false);
              setErrorMessage('');
              // Focus on editor after modal is closed
              const cliparea = document.querySelector('.cliparea');
              cliparea?.focus();
            }}
          />
        )}
      </>
    </ThemeProvider>
  );
};

export type { AppCallProps };
export { App };
