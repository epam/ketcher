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

import { BaseCallProps, BaseProps } from '../../../modal.types';
import { FC, useEffect, useState } from 'react';
import { Dialog, LoadingCircles } from '../../../../components';
import classes from './Open.module.less';
import Recognize from '../../process/Recognize/Recognize';
import { fileOpener } from '../../../../../utils/';
import { DialogActionButton } from './components/DialogActionButton';
import { ViewSwitcher } from './components/ViewSwitcher';
import { getFormatMimeTypeByFileName, ketcherProvider } from 'ketcher-core';
interface OpenProps {
  server: any;
  errorHandler: (err: string) => void;
  isRecognizeDisabled: boolean;
  isAnalyzingFile: boolean;
  ignoreChiralFlag: boolean;
}

type Props = OpenProps &
  Pick<BaseProps, 'className'> &
  BaseCallProps & { onImageUpload: (file: File) => void };

const MODAL_STATES = {
  idle: 'idle',
  textEditor: 'textEditor',
  imageRec: 'imageRec',
  presentationViewer: 'presentationViewer',
};

const FooterContent = ({
  structStr,
  openHandler,
  copyHandler,
  onCancel,
  isAddToCanvasDisabled,
}) => {
  return (
    <div className={classes.footerContent}>
      <button onClick={onCancel} className={classes.cancelButton}>
        Cancel
      </button>
      <div className={classes.buttonsContainer}>
        <DialogActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          styles={classes.openButton}
          label="Open as New Project"
        />
        <DialogActionButton
          key="copyButton"
          disabled={!structStr || isAddToCanvasDisabled}
          clickHandler={copyHandler}
          styles={classes.copyButton}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
        />
      </div>
    </div>
  );
};

const Open: FC<Props> = (props) => {
  const {
    server,
    onImageUpload,
    errorHandler,
    isAnalyzingFile,
    isRecognizeDisabled,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    ignoreChiralFlag,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    ...rest
  } = props;

  const [structStr, setStructStr] = useState<string>('');
  const [structList, setStructList] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [opener, setOpener] = useState<any>();
  const [currentState, setCurrentState] = useState(MODAL_STATES.idle);
  const [isLoading, setIsLoading] = useState(false);
  const ketcher = ketcherProvider.getKetcher();

  useEffect(() => {
    if (server) {
      fileOpener(server).then((chosenOpener) => {
        setOpener({ chosenOpener });
      });
    }
  }, [server]);

  const onFileLoad = (files) => {
    setIsLoading(true);
    const onLoad = (fileContent) => {
      if (fileContent.isPPTX) {
        setStructStr('');
        setStructList(fileContent.structures);
        setCurrentState(MODAL_STATES.presentationViewer);
      } else {
        setStructStr(fileContent);
        setCurrentState(MODAL_STATES.textEditor);
      }
      setIsLoading(false);
    };
    const onError = () => {
      setIsLoading(false);
      errorHandler('Error processing file');
    };

    setFileName(files[0].name);
    opener.chosenOpener(files[0]).then(onLoad, onError);
  };

  const onImageLoad = (files) => {
    onImageUpload(files[0]);
    setCurrentState(MODAL_STATES.imageRec);
  };

  // @TODO after Recognize is refactored this will not be necessary
  // currently not destructuring onOk with other props so we can pass it with ...rest to Recognize below
  const { onOk } = rest;

  const copyHandler = () => {
    const format = getFormatMimeTypeByFileName(fileName);
    onOk({ structStr, fragment: true, 'input-format': format });
  };

  const openHandler = () => {
    onOk({ structStr, fragment: false });
  };

  const withFooterContent =
    (currentState === MODAL_STATES.textEditor ||
      currentState === MODAL_STATES.presentationViewer) &&
    !isAnalyzingFile;

  // @TODO after refactoring of Recognize modal
  // add Recognize rendering logic into ViewSwitcher component here
  if (currentState === MODAL_STATES.imageRec) {
    return <Recognize {...rest} />;
  }

  return (
    <Dialog
      title="Open structure"
      className={classes.open}
      params={rest}
      result={() => null}
      data-testid="openStructureModal"
      footerContent={
        withFooterContent ? (
          <FooterContent
            structStr={structStr}
            openHandler={openHandler}
            copyHandler={copyHandler}
            onCancel={rest.onCancel}
            isAddToCanvasDisabled={ketcher.editor.render.options.viewOnlyMode}
          />
        ) : undefined
      }
      buttons={[]}
      withDivider
    >
      <ViewSwitcher
        isAnalyzingFile={isAnalyzingFile}
        fileName={fileName}
        currentState={currentState}
        states={MODAL_STATES}
        selectClipboard={() => setCurrentState(MODAL_STATES.textEditor)}
        fileLoadHandler={onFileLoad}
        imageLoadHandler={onImageLoad}
        errorHandler={errorHandler}
        isRecognizeDisabled={isRecognizeDisabled}
        structStr={structStr}
        inputHandler={setStructStr}
        autoFocus
        structList={structList}
      />
      {isLoading && (
        <div className={classes.loadingContainer}>
          <LoadingCircles />
        </div>
      )}
    </Dialog>
  );
};

export type { OpenProps };
export default Open;
