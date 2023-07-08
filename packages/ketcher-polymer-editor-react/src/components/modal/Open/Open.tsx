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

export interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

const MODAL_STATES = {
  openOptions: 'openOptions',
  textEditor: 'textEditor',
};

// TODO: replace after the implementation of the function for processing the structure from the file
const onOk = ({ struct, fragment }) => {
  if (fragment) {
    console.log('add fragment');
  }
  console.log(struct);
};
const isAnalyzingFile = false;
const errorHandler = (error) => console.log(error);

const Open = ({ isModalOpen, onClose }: Props) => {
  const [structStr, setStructStr] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [opener, setOpener] = useState<
    { chosenOpener: FileOpener } | undefined
  >();
  const [currentState, setCurrentState] = useState(MODAL_STATES.openOptions);

  useEffect(() => {
    fileOpener().then((chosenOpener) => {
      setOpener({ chosenOpener });
    });
  }, []);

  const onCloseCallback = useCallback(() => {
    setCurrentState(MODAL_STATES.openOptions);
    setStructStr('');
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
    onOk({ struct: structStr, fragment: true });
    onCloseCallback();
  };

  const openHandler = () => {
    onOk({ struct: structStr, fragment: false });
    onCloseCallback();
  };

  const getButtons = () => {
    if (currentState === MODAL_STATES.textEditor && !isAnalyzingFile) {
      return [
        <ActionButton
          key="copyButton"
          disabled={!structStr}
          clickHandler={copyHandler}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
          styleType="secondary"
        />,
        <ActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          label="Open as New Project"
        />,
      ];
    } else {
      return [];
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      title="Open Structure"
      onClose={onCloseCallback}
    >
      <Modal.Content>
        <ViewSwitcher
          isAnalyzingFile={isAnalyzingFile}
          fileName={fileName}
          currentState={currentState}
          states={MODAL_STATES}
          selectClipboard={() => setCurrentState(MODAL_STATES.textEditor)}
          fileLoadHandler={onFileLoad}
          errorHandler={errorHandler}
          struct={structStr}
          inputHandler={setStructStr}
        />
      </Modal.Content>
      <Modal.Footer>{getButtons()}</Modal.Footer>
    </Modal>
  );
};
export { Open };
