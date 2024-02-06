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
} from 'ketcher-core';
import { IndigoProvider } from 'ketcher-react';
import assert from 'assert';
import { RequiredModalProps } from '../modalContainer';
import { OpenFileWrapper } from './Open.styles';
import { Loader, StyledDropdown, stylesForExpanded } from '../save/Save.styles';
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
    }`,
);

const OpenFooter = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
});

const FooterSelectorContainer = styled.div({
  height: '24px',
  fontSize: '12px',
});

const FooterFormatSelector = styled(StyledDropdown)({
  width: '180px',
});

const FooterSequenceSelector = styled(StyledDropdown)({
  width: '140px',
  margin: '0 8px',
});

const FooterButton = styled(ActionButton)({
  margin: '0 8px',
  width: '100px',
});

const KET = 'ket';
const SEQ = 'seq';
const RNA = 'rna';

const options: Array<Option> = [
  { id: 'ket', label: 'Ket' },
  { id: 'mol', label: 'MDL Molfile V3000' },
  { id: 'seq', label: 'Sequence' },
];

const sequenceOptions: Array<Option> = [
  { id: 'rna', label: 'RNA' },
  { id: 'dna', label: 'DNA' },
  { id: 'peptide', label: 'Peptide' },
];

const inputFormats = {
  ket: 'chemical/x-indigo-ket',
  mol: 'chemical/x-mdl-molfile',
  rna: 'chemical/x-rna-sequence',
  dna: 'chemical/x-dna-sequence',
  peptide: 'chemical/x-peptide-sequence',
};

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
  const deserialisedKet = ketSerializer.deserializeToDrawingEntities(struct);
  assert(deserialisedKet);
  deserialisedKet.drawingEntitiesManager.centerMacroStructure();
  const modelChanges = deserialisedKet.drawingEntitiesManager.mergeInto(
    editor.drawingEntitiesManager,
  );
  const editorHistory = new EditorHistory(editor);
  editorHistory.update(modelChanges);
  editor.renderersContainer.update(modelChanges);
};

// TODO: replace after the implementation of the function for processing the structure from the file
const onOk = async ({
  struct,
  formatSelection,
  sequenceSelection,
  onCloseCallback,
  setIsLoading,
  dispatch,
}: {
  struct: string;
  formatSelection: string;
  sequenceSelection: string;
  onCloseCallback: () => void;
  setIsLoading: (isLoading: boolean) => void;
  dispatch: Dispatch<AnyAction>;
}) => {
  const isKet = formatSelection === KET;
  const ketSerializer = new KetSerializer();
  const editor = CoreEditor.provideEditorInstance();
  if (isKet) {
    addToCanvas({ struct, ketSerializer, editor });
    onCloseCallback();
    return;
  }
  const indigo = IndigoProvider.getIndigo() as StructService;
  const inputFormat =
    formatSelection === SEQ
      ? inputFormats[sequenceSelection]
      : inputFormats[formatSelection];

  try {
    setIsLoading(true);
    const ketStruct = await indigo.convert({
      struct,
      output_format: ChemicalMimeType.KET,
      input_format: inputFormat,
    });
    addToCanvas({ struct: ketStruct.struct, ketSerializer, editor });
    onCloseCallback();
  } catch (error) {
    const stringError =
      typeof error === 'string' ? error : JSON.stringify(error);
    const errorMessage = 'Convert error! ' + stringError;
    dispatch(
      openErrorModal({ errorMessage, errorTitle: 'Unsupported symbols' }),
    );
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
  const [sequenceSelection, setSequenceSelection] = useState(RNA);

  useEffect(() => {
    const fileExtension = fileName?.split('.')[1];

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
    setSequenceSelection(RNA);
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

  const copyHandler = () => {
    onOk({
      struct: structStr,
      formatSelection,
      sequenceSelection,
      onCloseCallback,
      setIsLoading,
      dispatch,
    });
  };

  const openHandler = () => {
    onOk({
      struct: structStr,
      formatSelection,
      sequenceSelection,
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
        {formatSelection === SEQ ? (
          <FooterSequenceSelector
            options={sequenceOptions}
            currentSelection={sequenceSelection}
            selectionHandler={setSequenceSelection}
            customStylesForExpanded={stylesForExpanded}
            key={sequenceSelection}
          />
        ) : null}
      </FooterSelectorContainer>
      <div>
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
          clickHandler={copyHandler}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
          data-testid="add-to-canvas-button"
        />
      </div>
    </OpenFooter>
  );

  return (
    <OpenModal
      isOpen={isModalOpen}
      title="Open Structure"
      onClose={onCloseCallback}
      modalWidth={currentState === MODAL_STATES.textEditor ? '600px' : ''}
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
