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
import { TextField } from 'components/shared/textEditor';
import { TextInputField } from 'components/shared/textInputField';
import { SaveButton } from 'components/modal/save/saveButton';
import { getPropertiesByFormat, SupportedFormats } from 'helpers/formats';
import { ActionButton } from 'components/shared/actionButton';
import { Icon } from 'ketcher-react';
import { KetSerializer } from 'ketcher-core';
import { saveAs } from 'file-saver';

interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

const options: Array<Option> = [
  { id: 'ket', label: 'Ket' },
  { id: 'mol', label: 'MDL Molfile V3000' },
];

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

const Label = styled.label(({ theme }) => ({
  marginRight: '8px',
  color: theme.ketcher.color.text.secondary,
}));

const StyledDropdown = styled(DropDown)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    border: 'none',
    backgroundColor: theme.ketcher.color.background.primary,
    color: theme.ketcher.color.text.primary,
    fontFamily: theme.ketcher.font.family.inter,
  },
}));

const stylesForExpanded = {
  border: 'none',
};

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    width: '520px',
    height: '358px',
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden',
  },
});

const ErrorsButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.ketcher.color.background.canvas,
  color: theme.ketcher.color.text.error,

  '&:hover': {
    backgroundColor: 'initial',
  },
}));

export const Save = ({ onClose, isModalOpen }: Props): JSX.Element => {
  const [currentFileFormat, setCurrentFileFormat] =
    useState<SupportedFormats>('ket');
  const [currentFileName, setCurrentFileName] = useState('ketcher');
  const [struct] = useState('');
  const [errors, setErrors] = useState('');

  const handleSelectChange = (value) => {
    setCurrentFileFormat(value);
  };

  const handleInputChange = (value) => {
    setCurrentFileName(value);
  };

  const handleSave = () => {
    const ketSerializer = new KetSerializer();
    const serializedKet = ketSerializer.serializeMacromolecules();
    const blob = new Blob([JSON.stringify(serializedKet)], {
      type: getPropertiesByFormat(currentFileFormat).mime,
    });
    saveAs(blob, getPropertiesByFormat(currentFileFormat).name);
  };

  const handleErrorsClick = () => {
    console.log('errors...');
  };

  useEffect(() => {
    if (currentFileFormat === 'ket') {
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
          <Row>
            <div>
              <TextInputField
                value={currentFileName}
                id="filename"
                onChange={handleInputChange}
                label="File name:"
              />
            </div>
            <div style={{ lineHeight: '24px' }}>
              <Label htmlFor="fileformat">File format:</Label>
              <StyledDropdown
                options={options}
                currentSelection={currentFileFormat}
                selectionHandler={handleSelectChange}
                customStylesForExpanded={stylesForExpanded}
              />
            </div>
          </Row>
          <TextField struct={struct} readonly selectOnInit />
        </Form>
      </Modal.Content>

      <Modal.Footer>
        {errors && (
          <ErrorsButton label="Errors" clickHandler={handleErrorsClick}>
            <Icon name="error" />
            Errors
          </ErrorsButton>
        )}

        <SaveButton
          label="Save as file"
          onSave={handleSave}
          disabled={!currentFileName}
        />
      </Modal.Footer>
    </StyledModal>
  );
};
