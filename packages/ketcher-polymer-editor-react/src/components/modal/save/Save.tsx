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

import { useEffect, useState } from 'react';

import { Modal } from 'components/shared/modal';
import { Option } from 'components/shared/dropDown/dropDown';
import { TextArea } from 'components/shared/TextArea';
import { TextInputField } from 'components/shared/textInputField';
import { getPropertiesByFormat, SupportedFormats } from 'helpers/formats';
import { ActionButton } from 'components/shared/actionButton';
import { IndigoProvider } from 'ketcher-react';
import {
  ChemicalMimeType,
  KetSerializer,
  StructService,
  CoreEditor,
  KetcherLogger,
} from 'ketcher-core';
import { saveAs } from 'file-saver';
import { RequiredModalProps } from '../modalContainer';
import { LoadingCircles } from '../Open/AnalyzingFile/LoadingCircles';
import {
  Form,
  Loader,
  Row,
  StyledDropdown,
  stylesForExpanded,
} from './Save.styles';
import styled from '@emotion/styled';

const options: Array<Option> = [
  { id: 'ket', label: 'Ket' },
  { id: 'mol', label: 'MDL Molfile V3000' },
];

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
  const [currentFileFormat, setCurrentFileFormat] =
    useState<SupportedFormats>('ket');
  const [currentFileName, setCurrentFileName] = useState('ketcher');
  const [struct, setStruct] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const indigo = IndigoProvider.getIndigo() as StructService;
  const editor = CoreEditor.provideEditorInstance();

  const handleSelectChange = async (fileFormat) => {
    setCurrentFileFormat(fileFormat);
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serialize(
      editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(),
      editor.drawingEntitiesManager,
    );
    if (fileFormat === 'ket') {
      setStruct(serializedKet);
      return;
    }

    try {
      setIsLoading(true);
      const result = await indigo.convert({
        struct: serializedKet,
        output_format: ChemicalMimeType.Mol,
      });
      setStruct(result.struct);
    } catch (error) {
      editor.events.error.dispatch(error);
      KetcherLogger.error(error);
      setCurrentFileFormat('ket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value) => {
    setCurrentFileName(value);
  };

  const handleSave = () => {
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serialize(
      editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(),
      editor.drawingEntitiesManager,
    );
    const blob = new Blob([serializedKet], {
      type: getPropertiesByFormat(currentFileFormat).mime,
    });
    const formatProperties = getPropertiesByFormat(currentFileFormat);
    saveAs(blob, `${currentFileName}${formatProperties.extensions[0]}`);
  };

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
    <StyledModal title="save structure" isOpen={isModalOpen} onClose={onClose}>
      <Modal.Content>
        <Form onSubmit={handleSave} id="save">
          <Row style={{ padding: '12px 12px 10px' }}>
            <div>
              <TextInputField
                value={currentFileName}
                id="filename"
                onChange={handleInputChange}
                label="File name:"
              />
            </div>
            <StyledDropdown
              label="File format:"
              options={options}
              currentSelection={currentFileFormat}
              selectionHandler={handleSelectChange}
              customStylesForExpanded={stylesForExpanded}
            />
          </Row>
          <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
            <TextArea value={struct} readonly selectOnInit />
            {isLoading && (
              <Loader>
                <LoadingCircles />
              </Loader>
            )}
          </div>
        </Form>
      </Modal.Content>

      <Modal.Footer>
        <ActionButton
          label="Cancel"
          styleType="secondary"
          clickHandler={onClose}
        />

        <ActionButton
          label="Save"
          clickHandler={handleSave}
          disabled={!currentFileName}
        />
      </Modal.Footer>
    </StyledModal>
  );
};
