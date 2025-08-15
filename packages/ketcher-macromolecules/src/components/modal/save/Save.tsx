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

import { useEffect, useLayoutEffect, useState, useRef } from 'react';

import { Modal } from 'components/shared/modal';
import { Option } from 'components/shared/dropDown/dropDown';
import { TextArea } from 'components/shared/TextArea';
import { TextInputField } from 'components/shared/textInputField';
import { getPropertiesByFormat, SupportedFormats } from 'helpers/formats';
import { ActionButton } from 'components/shared/actionButton';
import {
  IconButton,
  IndigoProvider,
  KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
} from 'ketcher-react';
import {
  ChemicalMimeType,
  KetSerializer,
  StructService,
  CoreEditor,
  KetcherLogger,
  getSvgFromDrawnStructures,
  isClipboardAPIAvailable,
  legacyCopy,
  isHelmCompatible,
} from 'ketcher-core';
import { saveAs } from 'file-saver';
import { RequiredModalProps } from '../modalContainer';
import { LoadingCircles } from '../Open/AnalyzingFile/LoadingCircles';
import {
  Form,
  Loader,
  PreviewContainer,
  Row,
  StyledDropdown,
  stylesForExpanded,
  SvgPreview,
} from './Save.styles';
import styled from '@emotion/styled';
import { useAppDispatch } from 'hooks';
import { openErrorModal } from 'state/modal';
// TODO: Make it type safe by using `SupportedFormats` as id
const options: Array<Option> = [
  { id: 'ket', label: 'Ket' },
  { id: 'mol', label: 'MDL Molfile V3000' },
  { id: 'sequence', label: 'Sequence (1-letter code)' },
  { id: 'sequence-3-letter', label: 'Sequence (3-letter code)' },
  { id: 'fasta', label: 'FASTA' },
  { id: 'idt', label: 'IDT' },
  { id: 'svg', label: 'SVG Document' },
  { id: 'helm', label: 'HELM' },
];

const formatDetector = {
  mol: ChemicalMimeType.Mol,
  fasta: ChemicalMimeType.FASTA,
  sequence: ChemicalMimeType.SEQUENCE,
  'sequence-3-letter': ChemicalMimeType.PeptideSequenceThreeLetter,
  idt: ChemicalMimeType.IDT,
  helm: ChemicalMimeType.HELM,
};

const StyledModal = styled(Modal)({
  '& div.MuiPaper-root': {
    background: 'white',
    minHeight: '400px',
    minWidth: '430px',
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden',
    height: '100%',
  },
});

export const Save = ({
  onClose,
  isModalOpen,
}: RequiredModalProps): JSX.Element => {
  const dispatch = useAppDispatch();
  const [currentFileFormat, setCurrentFileFormat] =
    useState<SupportedFormats>('ket');
  const [currentFileName, setCurrentFileName] = useState('ketcher');
  const [struct, setStruct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [svgData, setSvgData] = useState<string | undefined>();
  const indigo = IndigoProvider.getIndigo() as StructService;
  const editor = CoreEditor.provideEditorInstance();
  const editorOffsetRef = useRef({ x: 0, y: 0 });
  // cache the editor root element so we don't query the DOM repeatedly
  const editorRootRef = useRef<Element | null>(null);

  const handleSelectChange = async (fileFormat) => {
    setCurrentFileFormat(fileFormat);
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serialize(
      editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(),
      editor.drawingEntitiesManager,
    );
    setSvgData(undefined);
    if (fileFormat === 'ket') {
      setStruct(serializedKet);
      return;
    }
    if (fileFormat === 'svg') {
      const svgData = getSvgFromDrawnStructures(editor.canvas, 'preview', {
        horizontal: editorOffsetRef.current.x,
        vertical: editorOffsetRef.current.y,
      });
      setSvgData(svgData);
      return;
    }
    if (
      fileFormat === 'helm' &&
      !isHelmCompatible(
        Array.from(editor.drawingEntitiesManager.monomers.values()),
        editor.monomersLibrary,
      )
    ) {
      editor.events.error.dispatch(
        'Some of the monomers do not have aliases in the HELM Core Library - they are exported using Ketcher aliases.',
      );
    }

    try {
      setIsLoading(true);
      if (fileFormat === 'fasta' || fileFormat === 'sequence') {
        const isValid =
          editor.drawingEntitiesManager.validateIfApplicableForFasta();
        if (!isValid) {
          throw new Error(
            'Error during sequence type recognition(RNA, DNA or Peptide)',
          );
        }
      }
      const result = await indigo.convert({
        struct: serializedKet,
        output_format: formatDetector[fileFormat],
      });
      setStruct(result.struct);
    } catch (error) {
      let stringError;
      if (error instanceof Error) {
        stringError = error.message;
      } else {
        stringError = typeof error === 'string' ? error : JSON.stringify(error);
      }
      const errorMessage = 'Convert error! ' + stringError;
      dispatch(openErrorModal(errorMessage));
      KetcherLogger.error(errorMessage);
      setCurrentFileFormat('ket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value) => {
    setCurrentFileName(value);
  };

  const calculateOffset = () => {
    // cache the editor root element to avoid repeated document.querySelector calls
    if (!editorRootRef.current) {
      editorRootRef.current = document.querySelector(
        KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
      );
    }

    const editorRootElement = editorRootRef.current;

    if (!editorRootElement) {
      if (editorOffsetRef.current.x !== 0 || editorOffsetRef.current.y !== 0) {
        editorOffsetRef.current = { x: 0, y: 0 };
      }
      return;
    }

    const { x = 0, y = 0 } = editorRootElement.getBoundingClientRect();

    if (editorOffsetRef.current.x === x && editorOffsetRef.current.y === y)
      return;

    editorOffsetRef.current = { x, y };
  };

  const handleSave = () => {
    let blobPart;
    if (currentFileFormat === 'svg') {
      const svgData = getSvgFromDrawnStructures(editor.canvas, 'file', {
        horizontal: editorOffsetRef.current.x,
        vertical: editorOffsetRef.current.y,
      });
      if (!svgData) {
        onClose();
        return;
      }
      blobPart = svgData;
    } else {
      blobPart = struct;
    }
    const blob = new Blob([blobPart], {
      type: getPropertiesByFormat(currentFileFormat).mime,
    });
    const formatProperties = getPropertiesByFormat(currentFileFormat);
    saveAs(blob, `${currentFileName}${formatProperties.extensions[0]}`);
    onClose();
  };

  const handleCopy = (event) => {
    event.preventDefault();

    try {
      if (isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(struct);
      } else {
        legacyCopy(event.clipboardData, {
          'text/plain': struct,
        });
      }
    } catch (e) {
      KetcherLogger.error('copyAs.js::copyAs', e);
      dispatch(openErrorModal('This feature is not available in your browser'));
    }
  };

  useLayoutEffect(() => {
    calculateOffset();
  }, []);

  useEffect(() => {
    if (currentFileFormat === 'ket') {
      const ketSerializer = new KetSerializer();
      const serializedKet = ketSerializer.serialize(
        editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(),
        editor.drawingEntitiesManager,
      );
      setStruct(serializedKet);
    }
  }, [currentFileFormat]);

  return (
    <StyledModal
      title="save structure"
      isOpen={isModalOpen}
      onClose={onClose}
      testId="save-structure-dialog"
    >
      <Modal.Content>
        <Form onSubmit={handleSave} id="save">
          <Row style={{ padding: '12px 12px 10px' }}>
            <div>
              <TextInputField
                value={currentFileName}
                id="filename"
                onChange={handleInputChange}
                label="File name:"
                data-testid="filename-input"
              />
            </div>
            <StyledDropdown
              label="File format:"
              options={options}
              currentSelection={currentFileFormat}
              selectionHandler={handleSelectChange}
              customStylesForExpanded={stylesForExpanded}
              testId="file-format-list"
            />
          </Row>
          {svgData ? (
            <SvgPreview
              dangerouslySetInnerHTML={{ __html: svgData }}
              data-testid="preview-area"
            />
          ) : (
            <PreviewContainer>
              <TextArea testId="preview-area" value={struct} readonly />
              <IconButton
                onClick={handleCopy}
                iconName="copy"
                title="Copy to clipboard"
                testId="copy-to-clipboard"
              />
              {isLoading && (
                <Loader>
                  <LoadingCircles />
                </Loader>
              )}
            </PreviewContainer>
          )}
        </Form>
      </Modal.Content>

      <Modal.Footer>
        <ActionButton
          label="Cancel"
          styleType="secondary"
          clickHandler={onClose}
          data-testid="cancel-button"
        />

        <ActionButton
          label="Save"
          clickHandler={handleSave}
          disabled={!currentFileName}
          data-testid="save-button"
        />
      </Modal.Footer>
    </StyledModal>
  );
};
