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

import { useEffect, useState } from 'react'
import styled from '@emotion/styled'

import { Modal } from 'components/shared/modal'
import { DropDown } from 'components/shared/dropDown'
import { Option } from 'components/shared/dropDown/dropDown'
import { TextField } from 'components/shared/textEditor'
import { TextInputField } from 'components/shared/textInputField'
import { SaveButton } from 'components/modal/save/saveButton'
import { getPropertiesByFormat, SupportedFormats } from 'helpers/formats'
import { ActionButton } from 'components/shared/actionButton'
import { Icon } from 'ketcher-react'

interface Props {
  onClose: () => void
  isModalOpen: boolean
}

const options: Array<Option> = [
  { id: 'mol', label: 'MDL Molfile V3000' },
  { id: 'helm', label: 'HELM' }
]

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column',
  height: '100%'
})

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px'
})

const Label = styled.label(({ theme }) => ({
  marginRight: '8px',
  color: theme.ketcher.color.text.secondary
}))

const StyledDropdown = styled(DropDown)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    border: 'none',
    backgroundColor: theme.ketcher.color.background.primary,
    color: theme.ketcher.color.text.primary,
    fontFamily: theme.ketcher.font.family.inter
  }
}))

const stylesForExpanded = {
  border: 'none'
}

const StyledModal = styled(Modal)({
  '& .MuiPaper-root': {
    width: '520px',
    height: '358px'
  },

  '& .MuiDialogContent-root': {
    overflow: 'hidden'
  }
})

const ErrorsButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: theme.ketcher.color.background.canvas,
  color: theme.ketcher.color.text.error,

  '&:hover': {
    backgroundColor: 'initial'
  }
}))

const structExample = {
  mol: `
    -INDIGO-02102212382D
  
    0  0  0  0  0  0  0  0  0  0  0 V3000
  M  V30 BEGIN CTAB
  M  V30 COUNTS 11 10 0 0 0
  M  V30 BEGIN ATOM
  M  V30 1 C 2.75 -5.225 0.0 0
  M  V30 2 C 3.61603 -5.725 0.0 0
  M  V30 3 C 4.48205 -5.225 0.0 0
  M  V30 4 C 5.34808 -5.725 0.0 0
  M  V30 5 C 6.2141 -5.225 0.0 0
  M  V30 6 C 7.08013 -5.725 0.0 0
  M  V30 7 C 7.94615 -5.225 0.0 0
  M  V30 8 C 8.81218 -5.725 0.0 0
  M  V30 9 C 9.6782 -5.225 0.0 0
  M  V30 10 C 10.5442 -5.725 0.0 0
  M  V30 11 C 11.4103 -5.225 0.0 0
  M  V30 END ATOM
  M  V30 BEGIN BOND
  M  V30 1 1 1 2
  M  V30 2 1 2 3
  M  V30 3 1 3 4
  M  V30 4 1 4 5
  M  V30 5 1 5 6
  M  V30 6 1 6 7
  M  V30 7 1 7 8
  M  V30 8 1 8 9
  M  V30 9 1 9 10
  M  V30 10 1 10 11
  M  V30 END BOND
  M  V30 END CTAB
  M  END
  `,
  helm: `PEPTIDE1{A.C.D.F.G.H.K.A.C.D}$PEPTIDE1,PEPTIDE1,3:R3-7:R3`
} // TODO remove when canvas and get struct method are ready

export const Save = ({ onClose, isModalOpen }: Props): JSX.Element => {
  const [currentFileFormat, setCurrentFileFormat] =
    useState<SupportedFormats>('mol')
  const [currentFileName, setCurrentFileName] = useState('ketcher')
  const [struct, setStruct] = useState('')
  const [errors, setErrors] = useState('')

  const handleSelectChange = (value) => {
    setCurrentFileFormat(value)
  }

  const handleInputChange = (value) => {
    setCurrentFileName(value)
  }

  const handleSave = () => {
    console.log('Saved', structExample)
  }

  const handleErrorsClick = () => {
    console.log('errors...')
  }

  useEffect(() => {
    console.log('Getting and setting struct here...') // get / convert struct and errors
    setStruct(structExample[currentFileFormat])

    if (currentFileFormat === 'mol') {
      // just an example
      setErrors('some error')
    } else {
      setErrors('')
    }
  }, [currentFileFormat])

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
          data={struct}
          type={getPropertiesByFormat(currentFileFormat).mime}
          onSave={handleSave}
          filename={
            currentFileName +
            getPropertiesByFormat(currentFileFormat).extensions[0]
          }
          disabled={!currentFileName}
        />
      </Modal.Footer>
    </StyledModal>
  )
}
