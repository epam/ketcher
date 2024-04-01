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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Global, ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material/styles';
import { debounce, merge } from 'lodash';
import {
  SdfSerializer,
  hotkeysConfiguration,
  generateMenuShortcuts,
  Nucleotide,
  Nucleoside,
} from 'ketcher-core';
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
import {
  MonomerLibrary,
  MonomerLibraryToggle,
} from 'components/monomerLibrary';
import { Menu } from 'components/menu';
import {
  createEditor,
  destroyEditor,
  selectEditor,
  selectEditorActiveTool,
  selectTool,
  showPreview,
} from 'state/common';
import {
  loadMonomerLibrary,
  selectMonomers,
  setFavoriteMonomersFromLocalStorage,
} from 'state/library';
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
import { DeepPartial } from './types';
import { EditorClassName } from 'ketcher-react';
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
import { ErrorModal } from 'components/modal/Error';
import { EditorWrapper } from './styledComponents';
import { useLoading } from './hooks/useLoading';
import { Loader } from 'components/Loader';
import { FullscreenButton } from 'components/FullscreenButton';
import { getDefaultPresets } from 'src/helpers/getDefaultPreset';
import {
  setDefaultPresets,
  setFavoritePresetsFromLocalStorage,
  clearFavorites,
} from 'state/rna-builder';
import { IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { LayoutModeButton } from 'components/LayoutModeButton';
import { useContextMenu } from 'react-contexify';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { SequenceItemContextMenu } from 'components/contextMenu/SequenceItemContextMenu';
import { SequenceStartArrow } from 'components/shared/monomerOnCanvas/SequenceStartArrow';
import { Preview } from 'components/shared/Preview';
import { SequenceTypeDropdown } from 'components/SequenceTypeButton';

const muiTheme = createTheme(muiOverrides);

interface EditorContainerProps {
  onInit?: () => void;
  theme?: DeepPartial<EditorTheme>;
  togglerComponent?: JSX.Element;
}

interface EditorProps {
  theme?: DeepPartial<EditorTheme>;
  togglerComponent?: JSX.Element;
}

const noPreviewTools = ['bond-single'];

const shortcuts =
  generateMenuShortcuts<typeof hotkeysConfiguration>(hotkeysConfiguration);

function EditorContainer({
  onInit,
  theme,
  togglerComponent,
}: EditorContainerProps) {
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
        <EditorWrapper ref={rootElRef} className={EditorClassName}>
          <Editor theme={editorTheme} togglerComponent={togglerComponent} />
        </EditorWrapper>
      </ThemeProvider>
    </Provider>
  );
}

function Editor({ theme, togglerComponent }: EditorProps) {
  const dispatch = useAppDispatch();
  const canvasRef = useRef<SVGSVGElement>(null);
  const errorTooltipText = useAppSelector(selectErrorTooltipText);
  const editor = useAppSelector(selectEditor);
  const activeTool = useAppSelector(selectEditorActiveTool);
  const isLoading = useLoading();
  const [isMonomerLibraryHidden, setIsMonomerLibraryHidden] = useState(false);
  const monomers = useAppSelector(selectMonomers);
  const { show: showSequenceContextMenu } = useContextMenu({
    id: CONTEXT_MENU_ID.FOR_SEQUENCE,
  });

  useEffect(() => {
    dispatch(createEditor({ theme, canvas: canvasRef.current }));
    const serializer = new SdfSerializer();
    const library = serializer.deserialize(monomersData);
    dispatch(loadMonomerLibrary(library));
    dispatch(setFavoriteMonomersFromLocalStorage(null));

    return () => {
      dispatch(destroyEditor(null));
      dispatch(loadMonomerLibrary([]));
      dispatch(clearFavorites());
    };
  }, [dispatch]);

  useEffect(() => {
    if (editor && monomers) {
      editor.setMonomersLibrary(monomers);
    }
  }, [editor, monomers]);

  useEffect(() => {
    const defaultPresets: IRnaPreset[] = getDefaultPresets(monomers);
    dispatch(setDefaultPresets(defaultPresets));
    dispatch(setFavoritePresetsFromLocalStorage());

    return () => {
      dispatch(clearFavorites());
    };
  }, [dispatch, monomers]);

  const dispatchShowPreview = useCallback(
    (payload) => dispatch(showPreview(payload)),
    [dispatch],
  );

  const debouncedShowPreview = useMemo(
    () => debounce((p) => dispatchShowPreview(p), 500),
    [dispatchShowPreview],
  );

  useEffect(() => {
    const handler = (toolName: string) => {
      if (toolName !== activeTool) {
        dispatch(selectTool(toolName));
      }
    };

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
      editor.events.selectTool.add(handler);
    }

    return () => {
      dispatch(selectTool(null));
      editor?.events.selectTool.remove(handler);
    };
  }, [editor]);

  const handleOpenPreview = useCallback(
    (e) => {
      const sequenceNode = e.target.__data__?.node;
      const isNucleotideOrNucleoside =
        sequenceNode instanceof Nucleotide ||
        sequenceNode instanceof Nucleoside;
      const monomer =
        e.target.__data__?.monomer?.monomerItem ||
        sequenceNode.monomer.monomerItem;

      const nucleotideParts =
        sequenceNode instanceof Nucleotide
          ? [
              sequenceNode.sugar.monomerItem,
              sequenceNode.rnaBase.monomerItem,
              sequenceNode.phosphate?.monomerItem,
            ]
          : sequenceNode instanceof Nucleoside
          ? [sequenceNode.sugar.monomerItem, sequenceNode.rnaBase.monomerItem]
          : null;

      const cardCoordinates = e.target.getBoundingClientRect();
      const top = calculatePreviewPosition(
        monomer,
        cardCoordinates,
        isNucleotideOrNucleoside,
      );
      const previewStyle = {
        top,
        left: `${cardCoordinates.left + cardCoordinates.width / 2}px`,
      };
      if (isNucleotideOrNucleoside) {
        debouncedShowPreview({
          nucleotide: nucleotideParts,
          style: previewStyle,
        });
      } else {
        debouncedShowPreview({ monomer, style: previewStyle });
      }
    },
    [debouncedShowPreview],
  );

  const handleClosePreview = useCallback(() => {
    debouncedShowPreview.cancel();
    dispatch(showPreview(undefined));
  }, [debouncedShowPreview, dispatch]);

  useEffect(() => {
    editor?.events.mouseOverMonomer.add(handleOpenPreview);
    editor?.events.mouseLeaveMonomer.add(handleClosePreview);
    editor?.events.mouseOverSequenceItem.add(handleOpenPreview);
    editor?.events.mouseLeaveSequenceItem.add(handleClosePreview);

    const onMoveHandler = (e) => {
      handleClosePreview();
      const isLeftClick = e.buttons === 1;
      if (!isLeftClick || !noPreviewTools.includes(activeTool)) {
        handleOpenPreview(e);
      }
    };
    editor?.events.mouseOnMoveMonomer.add(onMoveHandler);
    editor?.events.mouseOnMoveSequenceItem.add(onMoveHandler);

    return () => {
      editor?.events.mouseOverMonomer.remove(handleOpenPreview);
      editor?.events.mouseLeaveMonomer.remove(handleClosePreview);
      editor?.events.mouseOnMoveMonomer.remove(onMoveHandler);
      editor?.events.mouseOnMoveSequenceItem.remove(onMoveHandler);
      editor?.events.mouseOverSequenceItem.remove(handleOpenPreview);
      editor?.events.mouseLeaveSequenceItem.remove(handleClosePreview);
    };
  }, [editor, activeTool, handleOpenPreview, handleClosePreview]);

  useEffect(() => {
    editor?.events.rightClickSequence.add((event) => {
      showSequenceContextMenu({
        event,
        props: {
          sequenceItemRenderer: event.target.__data__,
        },
      });
    });
    editor?.events.rightClickCanvas.add((event) => {
      showSequenceContextMenu({
        event,
        props: {},
      });
    });
  }, [editor]);

  useEffect(() => {
    editor?.zoomTool.observeCanvasResize();
    return () => {
      editor?.zoomTool.destroy();
    };
  }, [editor]);

  const handleCloseErrorTooltip = () => {
    dispatch(closeErrorTooltip());
  };

  return (
    <>
      <Layout>
        <Layout.Top shortened={isMonomerLibraryHidden}>
          <SequenceTypeDropdown />
          <LayoutModeButton />
          {togglerComponent}
          <FullscreenButton />
        </Layout.Top>

        <Layout.Left>
          <MenuComponent />
        </Layout.Left>

        <Layout.Main>
          <svg
            id="polymer-editor-canvas"
            data-testid="ketcher-canvas"
            preserveAspectRatio="xMidYMid meet"
            ref={canvasRef}
            width="100%"
            height="100%"
            style={{
              overflow: 'hidden',
              overflowClipMargin: 'content-box',
            }}
          >
            <defs>
              <PeptideAvatar />
              <ChemAvatar />
              <SugarAvatar />
              <PhosphateAvatar />
              <RNABaseAvatar />
              <SequenceStartArrow />
            </defs>
            <g className="drawn-structures"></g>
          </svg>
          {isLoading && <Loader />}
        </Layout.Main>

        <Layout.Right hide={isMonomerLibraryHidden}>
          <MonomerLibrary />
        </Layout.Right>
      </Layout>
      <MonomerLibraryToggle
        isHidden={isMonomerLibraryHidden}
        onClick={() => setIsMonomerLibraryHidden((prev) => !prev)}
      />
      <Preview />
      <SequenceItemContextMenu />
      <ModalContainer />
      <ErrorModal />
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
  const editor = useAppSelector(selectEditor);
  const activeMenuItems = [activeTool];

  const menuItemChanged = (name) => {
    if (modalComponentList[name]) {
      dispatch(openModal(name));
    } else if (name === 'undo' || name === 'redo') {
      editor.events.selectHistory.dispatch(name);
    } else if (!['zoom-in', 'zoom-out', 'zoom-reset'].includes(name)) {
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
        <Menu.Item
          itemId="clear"
          title={`Clear Canvas (${shortcuts.clear})`}
          testId="clear-canvas"
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item
          itemId="undo"
          title={`Undo (${shortcuts.undo})`}
          testId="undo"
        />
        <Menu.Item
          itemId="redo"
          title={`Redo (${shortcuts.redo})`}
          testId="redo"
        />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item itemId="open" title="Open..." testId="open-button" />
        <Menu.Item itemId="save" title="Save as..." testId="save-button" />
      </Menu.Group>
      <Menu.Group>
        <Menu.Item
          itemId="erase"
          title={`Erase (${shortcuts.erase})`}
          testId="erase"
        />
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
        <Menu.Item
          itemId="zoom-in"
          title={`Zoom In (${shortcuts['zoom-plus']})`}
          testId="zoom-in-button"
        />
        <Menu.Item
          itemId="zoom-out"
          title={`Zoom Out (${shortcuts['zoom-minus']})`}
          testId="zoom-out-button"
        />
        <Menu.Item
          itemId="zoom-reset"
          title={`Reset Zoom (${shortcuts['zoom-reset']})`}
          testId="reset-zoom-button"
        />
      </Menu.Group>
    </Menu>
  );
}

export { EditorContainer as Editor };
