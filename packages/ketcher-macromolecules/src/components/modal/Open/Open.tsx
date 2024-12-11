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
import { Modal } from 'components/shared/modal';
import { useCallback, useEffect, useState } from 'react';
import { ViewSwitcher } from './ViewSwitcher';
import { ActionButton } from 'components/shared/actionButton';
import { FileOpener, fileOpener } from './fileOpener';
import {
  ChemicalMimeType,
  KetSerializer,
  StructService,
  CoreEditor,
  KetcherLogger,
  EditorHistory,
  SequenceMode,
  macromoleculesFilesInputFormats,
  ModeTypes,
  SnakeMode,
  FlexMode,
} from 'ketcher-core';
import { IndigoProvider } from 'ketcher-react';
import { RequiredModalProps } from '../modalContainer';
import { OpenFileWrapper } from './Open.styles';
import {
  Loader,
  StyledDropdown as SaveDropdown,
  stylesForExpanded,
} from '../save/Save.styles';
import { LoadingCircles } from './AnalyzingFile/LoadingCircles';
import { useAppDispatch } from 'hooks';
import { openErrorModal } from 'state/modal';
import { AnyAction, Dispatch } from 'redux';
import styled from '@emotion/styled';
import { Option } from 'components/shared/dropDown/dropDown';

export interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

const OpenModal = styled(Modal)(
  ({ modalWidth }) => `
    .MuiPaper-root {
      width: ${modalWidth};
      max-width: ${modalWidth};
    }`,
);

const OpenFooter = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const FooterSelectorContainer = styled.div({
  display: 'flex',
  height: '24px',
  fontSize: '12px',
});

const StyledDropdown = styled(SaveDropdown)({
  padding: 0,
  fontSize: '12px',

  '& .MuiSelect-select': {
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px 0 8px',
    paddingRight: '20px !important', // override MUI styles
    height: '100%',
  },

  '& span': {
    fontSize: '12px',
  },
});

const FooterFormatSelector = styled(StyledDropdown)(() => ({
  width: '140px',
}));

const FooterSequenceSelector = styled(StyledDropdown)({
  width: '76px',
  marginLeft: '8px',
});

const FooterPeptideLettersSelector = styled(StyledDropdown)({
  width: '105px',
  marginLeft: '8px',
});

const FooterButtonContainer = styled('div')({
  display: 'flex',
  gap: '10px',
});

const FooterButton = styled(ActionButton)({
  width: 'min-content',
});

const KET = 'ket';
const SEQ = 'seq';
const RNA = 'rna';
const PEPTIDE = 'peptide';
const FASTA = 'fasta';
const ONE_LETTER = 'one-letter';
const THREE_LETTER = 'three-letter';

const options: Array<Option> = [
  { id: 'ket', label: 'Ket' },
  { id: 'mol', label: 'MDL Molfile V3000' },
  { id: 'seq', label: 'Sequence' },
  { id: 'fasta', label: 'FASTA' },
  { id: 'idt', label: 'IDT' },
  { id: 'helm', label: 'HELM' },
];

const additionalOptions: Array<Option> = [
  { id: RNA, label: 'RNA' },
  { id: 'dna', label: 'DNA' },
  { id: PEPTIDE, label: 'Peptide' },
];

const peptideLettersFormatOptions: Array<Option> = [
  { id: ONE_LETTER, label: '1-letter code' },
  { id: THREE_LETTER, label: '3-letter code' },
];

const inputFormats = macromoleculesFilesInputFormats;

export const MODAL_STATES = {
  openOptions: 'openOptions',
  textEditor: 'textEditor',
} as const;

export type MODAL_STATES_VALUES =
  typeof MODAL_STATES[keyof typeof MODAL_STATES];

const addToCanvas = ({
  ketSerializer,
  editor,
  struct,
}: {
  ketSerializer: KetSerializer;
  editor: CoreEditor;
  struct: string;
}) => {
  const isCanvasEmptyBeforeOpenStructure =
    !editor.drawingEntitiesManager.hasDrawingEntities;
  const deserialisedKet = ketSerializer.deserializeToDrawingEntities(struct);

  if (!deserialisedKet) {
    throw new Error('Error during parsing file');
  }

  deserialisedKet.drawingEntitiesManager.centerMacroStructure();
  const { command: modelChanges } =
    deserialisedKet.drawingEntitiesManager.mergeInto(
      editor.drawingEntitiesManager,
    );
  const editorHistory = new EditorHistory(editor);
  const isSequenceMode = editor.mode instanceof SequenceMode;
  const isSnakeMode = editor.mode instanceof SnakeMode;
  const isFlexMode = editor.mode instanceof FlexMode;

  if (isFlexMode) {
    editor.drawingEntitiesManager.recalculateAntisenseChains();

    if (editor.drawingEntitiesManager.hasAntisenseChains) {
      modelChanges.merge(
        editor.drawingEntitiesManager.applySnakeLayout(
          editor.canvas.width.baseVal.value,
          true,
          true,
          true,
        ),
      );
    }
  }

  editor.renderersContainer.update(modelChanges);
  editorHistory.update(modelChanges);

  if (isSequenceMode) {
    modelChanges.setUndoOperationReverse();
    editor.events.selectMode.dispatch({
      mode: ModeTypes.sequence,
      mergeWithLatestHistoryCommand: true,
    });
  }

  if (isSnakeMode) {
    modelChanges.setUndoOperationReverse();
    editor.events.selectMode.dispatch({
      mode: ModeTypes.snake,
      mergeWithLatestHistoryCommand: true,
    });
  }

  if (isCanvasEmptyBeforeOpenStructure) {
    editor.zoomToStructuresIfNeeded();
  }
};

// TODO: replace after the implementation of the function for processing the structure from the file
const onOk = async ({
  struct,
  formatSelection,
  additionalSelection,
  peptideLettersFormatSelection,
  onCloseCallback,
  setIsLoading,
  dispatch,
}: {
  struct: string;
  formatSelection: string;
  additionalSelection: string;
  peptideLettersFormatSelection: string;
  onCloseCallback: () => void;
  setIsLoading: (isLoading: boolean) => void;
  dispatch: Dispatch<AnyAction>;
}) => {
  const isKet = formatSelection === KET;
  const isSeq = formatSelection === SEQ;
  const isFasta = formatSelection === FASTA;
  const ketSerializer = new KetSerializer();
  const editor = CoreEditor.provideEditorInstance();
  let inputFormat;
  let fileData = struct;

  const showParsingError = (stringError) => {
    const errorMessage = 'Convert error! ' + stringError;
    dispatch(
      openErrorModal({
        errorMessage,
        errorTitle: isSeq || isFasta ? 'Unsupported symbols' : '',
      }),
    );
  };

  if (isKet) {
    try {
      addToCanvas({ struct, ketSerializer, editor });
      onCloseCallback();
    } catch (e) {
      showParsingError('Error during file parsing.');
    }
    return;
  } else if (
    isFasta ||
    (isSeq && peptideLettersFormatSelection !== THREE_LETTER)
  ) {
    inputFormat = inputFormats[formatSelection][additionalSelection];
    fileData = fileData.toUpperCase();
  } else if (isSeq && peptideLettersFormatSelection === THREE_LETTER) {
    inputFormat = inputFormats.seq.peptide3Letter;
  } else {
    inputFormat = inputFormats[formatSelection];
  }
  const indigo = IndigoProvider.getIndigo() as StructService;

  try {
    setIsLoading(true);

    const ketStruct = await indigo.convert({
      struct: fileData,
      output_format: ChemicalMimeType.KET,
      input_format: inputFormat,
    });
    addToCanvas({ struct: ketStruct.struct, ketSerializer, editor });
    onCloseCallback();
  } catch (error) {
    const stringError =
      typeof error === 'string' ? error : JSON.stringify(error);
    showParsingError(stringError);
    KetcherLogger.error(error);
  } finally {
    setIsLoading(false);
  }
};
const isAnalyzingFile = false;
const errorHandler = (error) => console.log(error);

const Open = ({ isModalOpen, onClose }: RequiredModalProps) => {
  const dispatch = useAppDispatch();
  const [structStr, setStructStr] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [opener, setOpener] = useState<
    { chosenOpener: FileOpener } | undefined
  >();
  const [currentState, setCurrentState] = useState<MODAL_STATES_VALUES>(
    MODAL_STATES.openOptions,
  );
  const [formatSelection, setFormatSelection] = useState(KET);
  const [additionalSelection, setAdditionalSelection] = useState(RNA);
  const [peptideLettersFormatSelection, setPeptideLettersFormatSelection] =
    useState(ONE_LETTER);

  useEffect(() => {
    const splittedFilenameByDot = fileName?.split('.');
    const fileExtension =
      splittedFilenameByDot[splittedFilenameByDot.length - 1];

    if (fileExtension) {
      const option = options.find((el) => el.id === fileExtension);
      const id = option?.id ? option.id : SEQ;
      setFormatSelection(id);
    }
  }, [fileName]);

  useEffect(() => {
    fileOpener().then((chosenOpener) => {
      setOpener({ chosenOpener });
    });
  }, []);

  const onCloseCallback = useCallback(() => {
    setCurrentState(MODAL_STATES.openOptions);
    setStructStr('');
    setFormatSelection(KET);
    setAdditionalSelection(RNA);
    onClose();
  }, [onClose]);

  const onFileLoad = (files: File[]) => {
    const onLoad = (fileContent) => {
      setStructStr(fileContent);
      setCurrentState(MODAL_STATES.textEditor);
    };
    const onError = () => errorHandler('Error processing file');

    setFileName(files[0].name);
    opener?.chosenOpener(files[0]).then(onLoad, onError);
  };

  const addToCanvasHandler = () => {
    onOk({
      struct: structStr,
      formatSelection,
      additionalSelection,
      peptideLettersFormatSelection,
      onCloseCallback,
      setIsLoading,
      dispatch,
    });
  };

  const openHandler = () => {
    const editor = CoreEditor.provideEditorInstance();
    const history = new EditorHistory(editor);
    const modelChanges = editor.drawingEntitiesManager.deleteAllEntities();

    history.update(modelChanges);
    editor.renderersContainer.update(modelChanges);
    editor.zoomToStructuresIfNeeded();

    onOk({
      struct: structStr,
      formatSelection,
      additionalSelection,
      peptideLettersFormatSelection,
      onCloseCallback,
      setIsLoading,
      dispatch,
    });
  };

  const renderFooter = () => (
    <OpenFooter>
      <FooterSelectorContainer>
        <FooterFormatSelector
          options={options}
          currentSelection={formatSelection}
          selectionHandler={setFormatSelection}
          customStylesForExpanded={stylesForExpanded}
          key={formatSelection}
        />
        {formatSelection === SEQ || formatSelection === FASTA ? (
          <FooterSequenceSelector
            options={additionalOptions}
            currentSelection={additionalSelection}
            selectionHandler={setAdditionalSelection}
            customStylesForExpanded={stylesForExpanded}
            key={additionalSelection}
            testId="dropdown-select-type"
          />
        ) : null}
        {formatSelection === SEQ && additionalSelection === PEPTIDE ? (
          <FooterPeptideLettersSelector
            options={peptideLettersFormatOptions}
            currentSelection={peptideLettersFormatSelection}
            selectionHandler={setPeptideLettersFormatSelection}
            testId="dropdown-select-peptide-letters-format"
          />
        ) : null}
      </FooterSelectorContainer>
      <FooterButtonContainer>
        <FooterButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          label="Open as New"
          styleType="secondary"
        />
        <FooterButton
          key="copyButton"
          disabled={!structStr}
          clickHandler={addToCanvasHandler}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
          data-testid="add-to-canvas-button"
        />
      </FooterButtonContainer>
    </OpenFooter>
  );

  return (
    <OpenModal
      isOpen={isModalOpen}
      title="Open Structure"
      onClose={onCloseCallback}
      modalWidth={currentState === MODAL_STATES.textEditor ? '620px' : ''}
    >
      <Modal.Content>
        <OpenFileWrapper currentState={currentState}>
          <ViewSwitcher
            isAnalyzingFile={isAnalyzingFile}
            fileName={fileName}
            currentState={currentState}
            states={MODAL_STATES}
            selectClipboard={() => setCurrentState(MODAL_STATES.textEditor)}
            fileLoadHandler={onFileLoad}
            errorHandler={errorHandler}
            value={structStr}
            inputHandler={setStructStr}
          />
          {isLoading && (
            <Loader>
              <LoadingCircles />
            </Loader>
          )}
        </OpenFileWrapper>
      </Modal.Content>
      {currentState === MODAL_STATES.textEditor && !isAnalyzingFile ? (
        <Modal.Footer withborder="true">{renderFooter()}</Modal.Footer>
      ) : (
        <></>
      )}
    </OpenModal>
  );
};
export { Open };
