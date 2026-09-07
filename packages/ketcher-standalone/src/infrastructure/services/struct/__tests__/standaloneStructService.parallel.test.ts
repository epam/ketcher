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

import IndigoService from '../standaloneStructService';
import { Command, OutputMessage } from '../indigoWorker.types';
import { ChemicalMimeType } from 'ketcher-core';
import { getIndigoWorker } from '_indigo-worker-import-alias_';

// Mock modules are defined in __mocks__ directory and configured in jest.config.js
jest.mock('_indigo-worker-import-alias_');
jest.mock('_indigo-ketcher-import-alias_');

// Mock ketcher-core functions that are called
jest.mock('ketcher-core', () => {
  const actual = jest.requireActual('ketcher-core');
  return {
    ...actual,
    provideEditorInstance: jest.fn(() => ({
      monomersLibraryParsedJson: {},
    })),
    pickStandardServerOptions: jest.fn(() => ({})),
    getLabelRenderModeForIndigo: jest.fn(() => undefined),
  };
});

const mockWorker = {
  postMessage: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  terminate: jest.fn(),
};

// Set up the mock worker implementation
(getIndigoWorker as jest.Mock).mockReturnValue(mockWorker);

describe('StandaloneStructService parallel requests (issue #2485)', () => {
  let service: IndigoService;
  let messageHandler: (e: MessageEvent<OutputMessage<string>>) => void;

  beforeEach(() => {
    jest.clearAllMocks();

    service = new IndigoService({});
    service.addKetcherId('test-ketcher-id');

    // Capture the message handler registered by the service
    const addEventListenerCalls = mockWorker.addEventListener.mock.calls;
    const messageCall = addEventListenerCalls.find(
      (call) => call[0] === 'message',
    );
    if (messageCall) {
      messageHandler = messageCall[1];
    }
  });

  afterEach(() => {
    service.destroy();
  });

  describe('generateImageAsBase64', () => {
    it('should handle parallel generateImage calls with out-of-order worker responses', async () => {
      const promise1 = service.generateImageAsBase64('C');
      const promise2 = service.generateImageAsBase64('N');
      const promise3 = service.generateImageAsBase64('C=C');

      // Simulate worker responding out of order: C=C, N, C
      // Each promise should receive the payload corresponding to its own inputData
      messageHandler({
        data: {
          type: Command.GenerateImageAsBase64,
          payload: 'base64_image_for_C=C',
          hasError: false,
          inputData: 'C=C',
        },
      } as MessageEvent<OutputMessage<string>>);

      messageHandler({
        data: {
          type: Command.GenerateImageAsBase64,
          payload: 'base64_image_for_N',
          hasError: false,
          inputData: 'N',
        },
      } as MessageEvent<OutputMessage<string>>);

      messageHandler({
        data: {
          type: Command.GenerateImageAsBase64,
          payload: 'base64_image_for_C',
          hasError: false,
          inputData: 'C',
        },
      } as MessageEvent<OutputMessage<string>>);

      const [result1, result2, result3] = await Promise.all([
        promise1,
        promise2,
        promise3,
      ]);

      // Each promise receives the correct payload based on inputData matching
      expect(result1).toBe('base64_image_for_C');
      expect(result2).toBe('base64_image_for_N');
      expect(result3).toBe('base64_image_for_C=C');

      // All three should be different
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
      expect(result1).not.toBe(result3);
    });
  });

  describe('convert', () => {
    it('should handle parallel convert calls correctly', async () => {
      const promise1 = service.convert({
        struct: 'C',
        output_format: ChemicalMimeType.Mol,
        input_format: ChemicalMimeType.Mol,
      });

      const promise2 = service.convert({
        struct: 'N',
        output_format: ChemicalMimeType.Mol,
        input_format: ChemicalMimeType.Mol,
      });

      // Simulate worker responses
      messageHandler({
        data: {
          type: Command.Convert,
          payload: 'molfile_for_C',
          hasError: false,
          inputData: 'C',
        },
      } as MessageEvent<OutputMessage<string>>);

      messageHandler({
        data: {
          type: Command.Convert,
          payload: 'molfile_for_N',
          hasError: false,
          inputData: 'N',
        },
      } as MessageEvent<OutputMessage<string>>);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.struct).toBe('molfile_for_C');
      expect(result2.struct).toBe('molfile_for_N');
    });
  });

  describe('error handling in parallel requests', () => {
    it('should handle one request succeeding and one failing', async () => {
      const promise1 = service.generateImageAsBase64('C');
      const promise2 = service.generateImageAsBase64('invalid');

      messageHandler({
        data: {
          type: Command.GenerateImageAsBase64,
          payload: 'base64_C',
          hasError: false,
          inputData: 'C',
        },
      } as MessageEvent<OutputMessage<string>>);

      messageHandler({
        data: {
          type: Command.GenerateImageAsBase64,
          payload: '',
          hasError: true,
          error: 'Invalid structure',
          inputData: 'invalid',
        },
      } as unknown as MessageEvent<OutputMessage<string>>);

      const result1 = await promise1;
      await expect(promise2).rejects.toThrow('Invalid structure');

      expect(result1).toBe('base64_C');
    });
  });
});
