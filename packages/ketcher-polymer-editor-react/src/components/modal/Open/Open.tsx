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
  SupportedFormat,
  identifyStructFormat,
  CoreEditor,
  KetcherLogger,
  EditorHistory,
  Vec2,
  Coordinates,
  DrawingEntitiesManager,
  BaseMonomer,
  PolymerBond,
} from 'ketcher-core';
import { IndigoProvider } from 'ketcher-react';
import assert from 'assert';
import { RequiredModalProps } from '../modalContainer';
import { CancelButton, OpenFileWrapper } from './Open.styles';
import { Loader } from '../save/Save.styles';
import { LoadingCircles } from './AnalyzingFile/LoadingCircles';
import { useAppDispatch } from 'hooks';
import { openErrorModal } from 'state/modal';
import { AnyAction, Dispatch } from 'redux';

export interface Props {
  onClose: () => void;
  isModalOpen: boolean;
}

export const MODAL_STATES = {
  openOptions: 'openOptions',
  textEditor: 'textEditor',
} as const;

export type MODAL_STATES_VALUES =
  typeof MODAL_STATES[keyof typeof MODAL_STATES];

const getStructureCenter = (drawingEntitiesManager: DrawingEntitiesManager) => {
  let xmin = 1e50;
  let ymin = xmin;
  let xmax = -xmin;
  let ymax = -ymin;

  drawingEntitiesManager.monomers.forEach((monomer: BaseMonomer) => {
    xmin = Math.min(xmin, monomer.position.x);
    ymin = Math.min(ymin, monomer.position.y);
    xmax = Math.max(xmax, monomer.position.x);
    ymax = Math.max(ymax, monomer.position.y);
  });
  drawingEntitiesManager.polymerBonds.forEach((bond: PolymerBond) => {
    xmin = Math.min(xmin, bond.position.x);
    ymin = Math.min(ymin, bond.position.y);
    xmax = Math.max(xmax, bond.position.x);
    ymax = Math.max(ymax, bond.position.y);
  });
  return new Vec2((xmin + xmax) / 2, (ymin + ymax) / 2);
};

const centerStructure = (
  editor: CoreEditor,
  drawingEntitiesManager: DrawingEntitiesManager,
) => {
  const centerPointOfCanvas = Coordinates.canvasToModel(
    new Vec2(editor.canvasOffset.width / 2, editor.canvasOffset.height / 2),
  );
  const structCenter = getStructureCenter(drawingEntitiesManager);
  const offset = Vec2.diff(centerPointOfCanvas, structCenter);
  drawingEntitiesManager.monomers.forEach((monomer: BaseMonomer) => {
    monomer.moveAbsolute(new Vec2(monomer.position).add(offset));
  });
  drawingEntitiesManager.polymerBonds.forEach((bond: PolymerBond) => {
    const { x: startX, y: startY } = new Vec2(bond.position).add(offset);
    bond.moveBondStartAbsolute(startX, startY);
    const { x: endX, y: endY } = new Vec2(bond.endPosition).add(offset);
    bond.moveBondEndAbsolute(endX, endY);
  });
};

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
  centerStructure(editor, deserialisedKet.drawingEntitiesManager);
  deserialisedKet.drawingEntitiesManager.mergeInto(
    editor.drawingEntitiesManager,
  );
  const editorHistory = new EditorHistory(editor);
  editorHistory.update(deserialisedKet.modelChanges);
  editor.renderersContainer.update(deserialisedKet.modelChanges);
};

// TODO: replace after the implementation of the function for processing the structure from the file
const onOk = async ({
  struct,
  fragment,
  onCloseCallback,
  setIsLoading,
  dispatch,
}: {
  struct: string;
  fragment: boolean;
  onCloseCallback: () => void;
  setIsLoading: (isLoading: boolean) => void;
  dispatch: Dispatch<AnyAction>;
}) => {
  if (fragment) {
    console.log('add fragment');
  }
  const isKet = identifyStructFormat(struct) === SupportedFormat.ket;
  const ketSerializer = new KetSerializer();
  const editor = CoreEditor.provideEditorInstance();
  if (isKet) {
    addToCanvas({ struct, ketSerializer, editor });
    onCloseCallback();
    return;
  }
  const indigo = IndigoProvider.getIndigo() as StructService;
  try {
    setIsLoading(true);
    const ketStruct = await indigo.convert({
      struct,
      output_format: ChemicalMimeType.KET,
    });
    addToCanvas({ struct: ketStruct.struct, ketSerializer, editor });
    onCloseCallback();
  } catch (error) {
    const stringError =
      typeof error === 'string' ? error : JSON.stringify(error);
    const errorMessage = 'Convert error! ' + stringError;
    dispatch(openErrorModal(errorMessage));
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
    onOk({
      struct: structStr,
      fragment: true,
      onCloseCallback,
      setIsLoading,
      dispatch,
    });
  };

  const openHandler = () => {
    onOk({
      struct: structStr,
      fragment: false,
      onCloseCallback,
      setIsLoading,
      dispatch,
    });
  };

  const getButtons = () => {
    if (currentState === MODAL_STATES.textEditor && !isAnalyzingFile) {
      return [
        <CancelButton
          key="cancelButton"
          clickHandler={onCloseCallback}
          label="Cancel"
          styleType="secondary"
        />,
        <ActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          label="Open as New Project"
          styleType="secondary"
        />,
        <ActionButton
          key="copyButton"
          disabled={!structStr}
          clickHandler={copyHandler}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
          data-testid="add-to-canvas-button"
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
      {getButtons().length === 0 ? (
        <></>
      ) : (
        <Modal.Footer withborder="true">{getButtons()}</Modal.Footer>
      )}
    </Modal>
  );
};
export { Open };
