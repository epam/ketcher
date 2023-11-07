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
import styled from '@emotion/styled';

import { Modal } from 'components/shared/modal';
import { DropDown } from 'components/shared/dropDown';
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
} from 'ketcher-core';
import { saveAs } from 'file-saver';
import { RequiredModalProps } from '../modalContainer';

const options: Array<Option> = [
  { id: 'ket', label: 'Ket' },
  { id: 'mol', label: 'MDL Molfile V3000' },
];

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  height: '300px',
});

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const StyledDropdown = styled(DropDown)(({ theme }) => ({
  width: 'calc(50% - 6px)',
  height: '28px',

  '& .MuiOutlinedInput-root:hover': {
    border: `1px solid ${theme.ketcher.color.input.border.hover}`,
  },

  '& .MuiOutlinedInput-root': {
    border: `1px solid ${theme.ketcher.color.input.border.regular}`,
    backgroundColor: theme.ketcher.color.background.primary,
    color: theme.ketcher.color.text.primary,
    fontFamily: theme.ketcher.font.family.inter,
  },
}));

const stylesForExpanded = {
  border: 'none',
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

const ErrorsButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.ketcher.color.background.canvas,
  color: theme.ketcher.color.text.error,

  '&:hover': {
    backgroundColor: 'initial',
  },
}));

export const Save = ({
  onClose,
  isModalOpen,
}: RequiredModalProps): JSX.Element => {
  const [currentFileFormat, setCurrentFileFormat] =
    useState<SupportedFormats>('ket');
  const [currentFileName, setCurrentFileName] = useState('ketcher');
  const [struct, setStruct] = useState('');
  const [errors, setErrors] = useState('');
  const indigo = IndigoProvider.getIndigo() as StructService;

  const handleSelectChange = async (value) => {
    setCurrentFileFormat(value);
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serializeMacromolecules();
    try {
      console.log('sending', JSON.stringify(serializedKet));
      const result = await indigo.convert({
        struct: JSON.stringify(serializedKet),
        output_format: ChemicalMimeType.Mol,
      });
      setStruct(result.struct);
      console.log(result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleInputChange = (value) => {
    setCurrentFileName(value);
  };

  const handleSave = () => {
    const ketSerializer = new KetSerializer();
    const editor = CoreEditor.provideEditorInstance();
    const serializedKet = ketSerializer.serialize(
      editor.drawingEntitiesManager.micromoleculesHiddenEntities.clone(),
      editor.drawingEntitiesManager,
    );
    const blob = new Blob([serializedKet], {
      type: getPropertiesByFormat(currentFileFormat).mime,
    });
    const formatProperties = getPropertiesByFormat(currentFileFormat);
    saveAs(blob, `${formatProperties.name}${formatProperties.extensions[0]}`);
  };

  const handleErrorsClick = () => {
    console.log('errors...');
  };

  useEffect(() => {
    if (currentFileFormat === 'ket') {
      const ketSerializer = new KetSerializer();
      const serializedKet = ketSerializer.serializeMacromolecules();
      setStruct(JSON.stringify(serializedKet, null, '\t'));
      // just an example
      setErrors('some error');
    } else {
      setErrors('');
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
          <div style={{ display: 'flex', flexGrow: 1 }}>
            <TextArea value={struct} readonly selectOnInit />
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
