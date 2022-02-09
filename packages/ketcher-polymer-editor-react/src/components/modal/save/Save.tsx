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

import { Modal } from 'components/shared/modal'
import { DropDown } from 'components/shared/dropDown'
import { Option } from 'components/shared/dropDown/dropDown'
import { useState } from 'react'
import styled from '@emotion/styled'
import { TextField } from 'components/shared/textEditor'

interface Props {
  onClose: () => void
  isModalOpen: boolean
  struct: string
}

const options: Array<Option> = [
  { id: 'mol', label: 'MDL Molfile V3000' },
  { id: 'helm', label: 'HELM' }
]

const Form = styled.form({
  display: 'flex',
  flexDirection: 'column'
})

const Row = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '16px'
})

const Label = styled.label({
  marginRight: '8px'
})

const Input = styled.input({
  height: '24px',
  padding: '0',
  border: 'none',
  borderRadius: '2px'
})

const StyledDropdown = styled(DropDown)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    border: 'none',
    backgroundColor: theme.ketcher.color.background.primary
  }
}))

const stylesForExpanded = {
  border: 'none'
}

export const Save = ({
  onClose,
  isModalOpen,
  struct = 'kjzhfjkshdfjkahkdf'
}: Props): JSX.Element => {
  const [currentFileFormat, setCurrentFileFormat] = useState('mol')
  const [currentFileName, setCurrentFileName] = useState('ketcher')

  const handleSelectChange = (value) => {
    setCurrentFileFormat(value)
  }

  const handleInputChange = (value) => {
    setCurrentFileName(value)
  }

  return (
    <Modal title="save structure" isOpen={isModalOpen} onClose={onClose}>
      <Modal.Content style={{ width: '494px' }}>
        <Form>
          <Row>
            <div>
              <Label htmlFor="filename">File name:</Label>
              <Input
                type="text"
                id="filename"
                value={currentFileName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="fileformat">File name:</Label>
              <StyledDropdown
                options={options}
                currentSelection={currentFileFormat}
                selectionHandler={handleSelectChange}
                customStylesForExpanded={stylesForExpanded}
              />
            </div>
          </Row>
          <TextField structStr={struct} readonly />
        </Form>
      </Modal.Content>
    </Modal>
  )
}
