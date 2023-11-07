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
import { Provider } from 'react-redux';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Global, ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { debounce, merge } from 'lodash';
import { SdfSerializer } from 'ketcher-core';
import monomersData from './data/monomers.sdf';

import { store } from 'state';
import {
  defaultTheme,
  muiOverrides,
  EditorTheme,
  MergedThemeType,
} from 'theming/defaultTheme';
import { getGlobalStyles } from 'theming/globalStyles';
import { Layout } from 'components/Layout';
import { MonomerLibrary } from 'components/monomerLibrary';
import { Menu } from 'components/menu';
import {
  createEditor,
  destroyEditor,
  selectEditor,
  selectEditorActiveTool,
  selectEditorBondMode,
  selectTool,
  showPreview,
  selectMode,
} from 'state/common';
import { loadMonomerLibrary } from 'state/library';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  closeErrorTooltip,
  openErrorTooltip,
  openModal,
  selectErrorTooltipText,
} from 'state/modal';
import {
  modalComponentList,
  ModalContainer,
} from 'components/modal/modalContainer';
import { FullscreenButton } from 'components/FullscreenButton';
import { DeepPartial } from './types';
import { EditorClassName } from './constants';
import { Snackbar } from '@mui/material';
import {
  StyledIconButton,
  StyledToast,
  StyledToastContent,
} from 'components/shared/StyledToast/styles';
import {
  PeptideAvatar,
  ChemAvatar,
  SugarAvatar,
  PhosphateAvatar,
  RNABaseAvatar,
} from 'components/shared/monomerOnCanvas';
import { MonomerConnectionOnlyProps } from 'components/modal/modalContainer/types';
import { calculatePreviewPosition } from 'helpers';
import StyledPreview from 'components/shared/MonomerPreview';

const muiTheme = createTheme(muiOverrides);

interface EditorContainerProps {
  onInit?: () => void;
  theme?: DeepPartial<EditorTheme>;
}

interface EditorProps {
  theme?: DeepPartial<EditorTheme>;
}

function EditorContainer({ onInit, theme }: EditorContainerProps) {
  const rootElRef = useRef<HTMLDivElement>(null);
  const editorTheme: EditorTheme = theme
    ? merge(defaultTheme, theme)
    : defaultTheme;

  const mergedTheme: MergedThemeType = merge(muiTheme, {
    ketcher: editorTheme,
  });

  useEffect(() => {
    onInit?.();
  }, [onInit]);

  return (
    <Provider store={store}>
      <ThemeProvider theme={mergedTheme}>
        <Global styles={getGlobalStyles} />
        <div ref={rootElRef} className={EditorClassName}>
          <Editor theme={editorTheme} />
        </div>
      </ThemeProvider>
    </Provider>
  );
}

function Editor({ theme }: EditorProps) {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<SVGSVGElement>(null);
  const errorTooltipText = useAppSelector(selectErrorTooltipText);
  const editor = useAppSelector(selectEditor);
  const activeTool = useAppSelector(selectEditorActiveTool);
  let keyboardEventListener;

  useEffect(() => {
    dispatch(createEditor({ theme, canvas: canvasRef.current }));
    const serializer = new SdfSerializer();
    const library = serializer.deserialize(monomersData);
    dispatch(loadMonomerLibrary(library));

    return () => {
      dispatch(destroyEditor(null));
      dispatch(loadMonomerLibrary([]));
      document.removeEventListener('keydown', keyboardEventListener);
    };
  }, [dispatch]);

  const dispatchShowPreview = useCallback(
    (payload) => dispatch(showPreview(payload)),
    [dispatch],
  );

  const debouncedShowPreview = useMemo(
    () => debounce((p) => dispatchShowPreview(p), 500),
    [dispatchShowPreview],
  );

  useEffect(() => {
    if (editor) {
      editor.events.error.add((errorText) => {
        dispatch(openErrorTooltip(errorText));
      });
      dispatch(selectTool('select-rectangle'));
      editor.events.selectTool.dispatch('select-rectangle');
      editor.events.openMonomerConnectionModal.add(
        (additionalProps: MonomerConnectionOnlyProps) =>
          dispatch(
            openModal({
              name: 'monomerConnection',
              additionalProps,
            }),
          ),
      );

      if (!keyboardEventListener) {
        keyboardEventListener = (e: KeyboardEvent) => {
          if (e.key === 'Escape') {
            dispatch(selectTool('select-rectangle'));
            editor.events.selectTool.dispatch('select-rectangle');
          }
        };
        document.addEventListener('keydown', keyboardEventListener);
      }
    }
  }, [editor]);

  const handleOpenPreview = useCallback((e) => {
    const monomer = e.target.__data__.monomer.monomerItem;

    const cardCoordinates = e.target.getBoundingClientRect();
    const top = calculatePreviewPosition(monomer, cardCoordinates);
    const previewStyle = {
      top,
      left: `${cardCoordinates.left + cardCoordinates.width / 2}px`,
    };
    debouncedShowPreview({ monomer, style: previewStyle });
  }, []);

  const handleClosePreview = () => {
    debouncedShowPreview.cancel();
    dispatch(showPreview(undefined));
  };

  useEffect(() => {
    editor?.events.mouseOverMonomer.add((e) => {
      handleOpenPreview(e);
    });
    editor?.events.mouseLeaveMonomer.add(() => {
      handleClosePreview();
    });
    editor?.events.mouseOnMoveMonomer.add((e) => {
      handleClosePreview();
      handleOpenPreview(e);
    });
  }, [editor, activeTool]);

  const handleCloseErrorTooltip = () => {
    dispatch(closeErrorTooltip());
  };

  return (
    <>
      <Layout>
        <Layout.Left>
          <MenuComponent />
        </Layout.Left>

        <Layout.Main>
          <svg
            id="polymer-editor-canvas"
            data-testid="ketcher-canvas"
            ref={canvasRef}
            width="100%"
            height="100%"
          >
            <defs>
              <PeptideAvatar />
              <ChemAvatar />
              <SugarAvatar />
              <PhosphateAvatar />
              <RNABaseAvatar />
            </defs>
          </svg>
        </Layout.Main>

        <Layout.Right>
          <MonomerLibrary />
        </Layout.Right>
      </Layout>
      <FullscreenButton />
      <StyledPreview className="polymer-library-preview" />
      <ModalContainer />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        open={Boolean(errorTooltipText)}
        onClose={handleCloseErrorTooltip}
        autoHideDuration={6000}
      >
        <StyledToast id="error-tooltip">
          <StyledToastContent data-testid="error-tooltip">
            {errorTooltipText}
          </StyledToastContent>
          <StyledIconButton
            iconName="close"
            onClick={handleCloseErrorTooltip}
          ></StyledIconButton>
        </StyledToast>
      </Snackbar>
    </>
  );
}

function MenuComponent() {
  const dispatch = useAppDispatch();
  const activeTool = useAppSelector(selectEditorActiveTool);
  const isSnakeMode = useAppSelector(selectEditorBondMode);
  const editor = useAppSelector(selectEditor);
  const activeMenuItems = [activeTool];
  if (isSnakeMode) activeMenuItems.push('snake-mode');
  const menuItemChanged = (name) => {
    if (modalComponentList[name]) {
      dispatch(openModal(name));
    } else if (name === 'snake-mode') {
      dispatch(selectMode(!isSnakeMode));
      editor.events.selectMode.dispatch(!isSnakeMode);
    } else {
      editor.events.selectTool.dispatch(name);
      if (name === 'clear') {
        dispatch(selectTool('select-rectangle'));
        editor.events.selectTool.dispatch('select-rectangle');
      } else {
        dispatch(selectTool(name));
      }
    }
  };

  return (
    <Menu
      testId="left-toolbar"
      onItemClick={menuItemChanged}
      activeMenuItems={activeMenuItems}
    >
      <Menu.Group>
        <Menu.Item itemId="clear" title="Clear Canvas" testId="clear-canvas" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="open" title="Open..." testId="open-button" />
        <Menu.Item
          itemId="save"
          data-testId="save-button"
          testId="save-button"
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="erase" title="Erase" testId="erase-button" />
        <Menu.Item
          itemId="select-rectangle"
          title="Select Rectangle"
          testId="select-rectangle"
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item
          itemId="bond-single"
          title="Single Bond (1)"
          testId="single-bond"
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="snake-mode" title="Snake mode" testId="snake-mode" />
      </Menu.Group>
    </Menu>
  );
}

export { EditorContainer as Editor };
