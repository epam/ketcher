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
import { Nucleotide, Nucleoside, NodeSelection } from 'ketcher-core';
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
import {
  createEditor,
  destroyEditor,
  selectEditor,
  selectEditorActiveTool,
  selectTool,
  showPreview,
} from 'state/common';
import {
  calculateMonomerPreviewTop,
  calculateNucleoElementPreviewTop,
} from 'helpers';
import {
  useAppDispatch,
  useAppSelector,
  useSequenceEditInRNABuilderMode,
} from 'hooks';
import {
  closeErrorTooltip,
  openErrorModal,
  openErrorTooltip,
  openModal,
  selectErrorTooltipText,
} from 'state/modal';
import { ModalContainer } from 'components/modal/modalContainer';
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
  UnresolvedMonomerAvatar,
  NucleotideAvatar,
} from 'components/shared/monomerOnCanvas';
import { MonomerConnectionOnlyProps } from 'components/modal/modalContainer/types';
import { ErrorModal } from 'components/modal/Error';
import {
  TopMenuRightWrapper,
  EditorWrapper,
  TogglerComponentWrapper,
} from './styledComponents';
import { useLoading } from './hooks/useLoading';
import useSetRnaPresets from './hooks/useSetRnaPresets';
import { Loader } from 'components/Loader';
import { FullscreenButton } from 'components/FullscreenButton';
import { LayoutModeButton } from 'components/LayoutModeButton';
import { useContextMenu } from 'react-contexify';
import { CONTEXT_MENU_ID } from 'components/contextMenu/types';
import { SequenceItemContextMenu } from 'components/contextMenu/SequenceItemContextMenu/SequenceItemContextMenu';
import { SequenceStartArrow } from 'components/shared/monomerOnCanvas/SequenceStartArrow';
import { Preview } from 'components/shared/Preview';
import { SequenceTypeDropdown } from 'components/SequenceTypeButton';
import { TopMenuComponent } from 'components/TopMenuComponent';
import { LeftMenuComponent } from 'components/LeftMenuComponent';
import { ZoomControls } from 'components/ZoomControls/ZoomControls';
import { VerticalDivider } from 'components/menu/styles';

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
  const isSequenceEditInRNABuilderMode = useSequenceEditInRNABuilderMode();
  const [selections, setSelections] = useState<NodeSelection[][]>();
  const { show: showSequenceContextMenu } = useContextMenu({
    id: CONTEXT_MENU_ID.FOR_SEQUENCE,
  });

  useEffect(() => {
    dispatch(createEditor({ theme, canvas: canvasRef.current }));

    return () => {
      dispatch(destroyEditor(null));
    };
  }, [dispatch]);

  useSetRnaPresets();

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
      editor.events.openErrorModal.add(
        (errorData: string | { errorMessage: string; errorTitle: string }) => {
          dispatch(openErrorModal(errorData));
        },
      );

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
      const cardCoordinates = e.target.getBoundingClientRect();
      const left = `${cardCoordinates.left + cardCoordinates.width / 2}px`;

      const sequenceNode = e.target.__data__?.node;
      const monomer =
        e.target.__data__?.monomer?.monomerItem ||
        sequenceNode.monomer.monomerItem;
      const isNucleotideOrNucleoside =
        sequenceNode instanceof Nucleotide ||
        sequenceNode instanceof Nucleoside;

      if (isNucleotideOrNucleoside) {
        const monomers =
          sequenceNode instanceof Nucleotide
            ? [
                sequenceNode.sugar.monomerItem,
                sequenceNode.rnaBase.monomerItem,
                sequenceNode.phosphate?.monomerItem,
              ]
            : [
                sequenceNode.sugar.monomerItem,
                sequenceNode.rnaBase.monomerItem,
              ];

        debouncedShowPreview({
          preset: {
            monomers,
          },
          style: {
            left,
            top: monomer
              ? calculateNucleoElementPreviewTop(cardCoordinates)
              : '',
            transform: 'translate(-50%, 0)',
          },
        });
        return;
      }

      debouncedShowPreview({
        monomer,
        style: {
          left,
          top: monomer ? calculateMonomerPreviewTop(cardCoordinates) : '',
        },
      });
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
    editor?.events.rightClickSequence.add((event, selections) => {
      setSelections(selections);
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
        <Layout.Top
          shortened={isMonomerLibraryHidden}
          data-testid="top-toolbar"
        >
          <TopMenuComponent />
          <TopMenuRightWrapper>
            <SequenceTypeDropdown />
            <LayoutModeButton />
            <TogglerComponentWrapper
              className={
                isSequenceEditInRNABuilderMode
                  ? 'toggler-component-wrapper--disabled'
                  : ''
              }
            >
              {togglerComponent}
            </TogglerComponentWrapper>
            <FullscreenButton />
            <VerticalDivider />
            <ZoomControls />
          </TopMenuRightWrapper>
        </Layout.Top>

        <Layout.Left>
          <LeftMenuComponent />
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
              <UnresolvedMonomerAvatar />
              <NucleotideAvatar />
              <SequenceStartArrow />
            </defs>
            <g className="drawn-structures"></g>
          </svg>
          {isLoading && <Loader />}
        </Layout.Main>

        <Layout.Right hide={isMonomerLibraryHidden}>
          <MonomerLibrary
            isSequenceEditInRNABuilderMode={isSequenceEditInRNABuilderMode}
          />
        </Layout.Right>
      </Layout>
      <MonomerLibraryToggle
        isHidden={isMonomerLibraryHidden}
        onClick={() => setIsMonomerLibraryHidden((prev) => !prev)}
      />
      <Preview />
      <SequenceItemContextMenu selections={selections} />
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

export { EditorContainer as Editor };
