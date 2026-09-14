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

import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { getStructure, ketcherProvider } from 'ketcher-core';
import { showSnackbarNotification } from '../../../state/notifications';
import { SelectedSmiles } from './SelectedSmiles';

const mockDispatch = jest.fn();

jest.mock('src/hooks', () => ({
  useAppContext: () => ({
    ketcherId: 'test-ketcher-id',
  }),
}));

jest.mock('../../../state/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('ketcher-core', () => ({
  SupportedFormat: {
    smiles: 'smiles',
  },
  getStructure: jest.fn(),
  ketcherProvider: {
    getKetcher: jest.fn(),
  },
  KetcherLogger: {
    error: jest.fn(),
  },
}));

const getStructureMock = getStructure as jest.Mock;
const getKetcherMock = ketcherProvider.getKetcher as jest.Mock;

function createSelectedStruct({
  atomsSize = 2,
  componentsCount = 1,
  simpleObjectsSize = 0,
  textsSize = 0,
  imagesSize = 0,
  rxnPlusesSize = 0,
  hasRxnArrow = false,
  hasMultitailArrow = false,
}: Partial<{
  atomsSize: number;
  componentsCount: number;
  simpleObjectsSize: number;
  textsSize: number;
  imagesSize: number;
  rxnPlusesSize: number;
  hasRxnArrow: boolean;
  hasMultitailArrow: boolean;
}> = {}) {
  return {
    atoms: { size: atomsSize },
    simpleObjects: { size: simpleObjectsSize },
    texts: { size: textsSize },
    images: { size: imagesSize },
    rxnPluses: { size: rxnPlusesSize },
    isBlank: () => atomsSize === 0,
    hasRxnArrow: () => hasRxnArrow,
    hasMultitailArrow: () => hasMultitailArrow,
    findConnectedComponents: () =>
      Array.from({ length: componentsCount }, () => new Set([1])),
  };
}

describe('SelectedSmiles', () => {
  const subscribeMock = jest.fn();
  const unsubscribeMock = jest.fn();
  const selectionMock = jest.fn();
  const explicitSelectedMock = jest.fn();
  const structSelectedMock = jest.fn();
  const errorHandlerMock = jest.fn();
  const writeTextMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    Object.defineProperty(window, 'isPolymerEditorTurnedOn', {
      configurable: true,
      value: false,
      writable: true,
    });

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: writeTextMock,
      },
    });

    selectionMock.mockReturnValue({ atoms: [1], bonds: [] });
    explicitSelectedMock.mockReturnValue({
      atoms: [1],
      bonds: [],
      simpleObjects: [],
      texts: [],
      images: [],
      rxnArrows: [],
      rxnPluses: [],
    });
    subscribeMock.mockImplementation(
      (_eventName: string, handler: () => void) => ({ handler }),
    );

    getKetcherMock.mockReturnValue({
      id: 'test-ketcher-id',
      formatterFactory: {},
      editor: {
        subscribe: subscribeMock,
        unsubscribe: unsubscribeMock,
        selection: selectionMock,
        explicitSelected: explicitSelectedMock,
        structSelected: structSelectedMock,
        errorHandler: errorHandlerMock,
      },
    });
  });

  it('renders selected SMILES for a single connected molecule', async () => {
    structSelectedMock.mockReturnValue(createSelectedStruct());
    getStructureMock.mockResolvedValue('CCO');

    render(<SelectedSmiles />);

    await waitFor(() => {
      expect(screen.getByTestId('selected-smiles-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('selected-smiles-button')).toHaveTextContent(
      'CCO',
    );
  });

  it('does not render anything for a disconnected selection', async () => {
    structSelectedMock.mockReturnValue(
      createSelectedStruct({ componentsCount: 2 }),
    );

    render(<SelectedSmiles />);

    await waitFor(() => {
      expect(structSelectedMock).toHaveBeenCalled();
    });

    expect(getStructureMock).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId('selected-smiles-button'),
    ).not.toBeInTheDocument();
  });

  it('copies selected SMILES and shows a snackbar notification on click', async () => {
    structSelectedMock.mockReturnValue(createSelectedStruct());
    getStructureMock.mockResolvedValue('CCO');
    writeTextMock.mockResolvedValue(undefined);

    render(<SelectedSmiles />);

    const button = await screen.findByTestId('selected-smiles-button');

    fireEvent.click(button);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('CCO');
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      showSnackbarNotification('SMILES copied'),
    );
  });
});
