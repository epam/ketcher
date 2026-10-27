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

import { customOnChangeHandler } from './customOnChangeHandler';

describe('customOnChangeHandler', () => {
  const originalIsPolymerEditorTurnedOn = window.isPolymerEditorTurnedOn;

  afterEach(() => {
    window.isPolymerEditorTurnedOn = originalIsPolymerEditorTurnedOn;
  });

  it('should call handler with no arguments when action is undefined', () => {
    const handler = jest.fn();
    customOnChangeHandler(undefined, handler);
    expect(handler).toHaveBeenCalledWith();
  });

  it('should call handler when in macro mode (isPolymerEditorTurnedOn = true)', () => {
    window.isPolymerEditorTurnedOn = true;
    const handler = jest.fn();
    const action = { operations: [] };
    customOnChangeHandler(action, handler);
    expect(handler).toHaveBeenCalledWith();
  });

  it('should call handler with empty data when action has no operations in micro mode', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    const action = {};
    customOnChangeHandler(action, handler);
    expect(handler).toHaveBeenCalledWith([]);
  });

  it('should call handler with empty data when action.operations is not an array in micro mode', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    const action = { operations: 'not-an-array' };
    customOnChangeHandler(action, handler);
    expect(handler).toHaveBeenCalledWith([]);
  });

  it('should call handler with empty data when action is null in micro mode', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    customOnChangeHandler(null, handler);
    expect(handler).toHaveBeenCalledWith([]);
  });

  it('should not mutate the original operations array', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    const operation1 = { _inverted: { type: 'test1' } };
    const operation2 = { _inverted: { type: 'test2' } };
    const operations = [operation1, operation2];
    const action = { operations };

    customOnChangeHandler(action, handler);

    // Verify original array is not mutated (reverse() used to mutate in-place)
    expect(operations[0]).toBe(operation1);
    expect(operations[1]).toBe(operation2);
  });

  it('should process operations and call handler with data in micro mode', () => {
    window.isPolymerEditorTurnedOn = false;
    const handler = jest.fn();
    const operation = {
      _inverted: {
        type: 'unknownType',
      },
    };
    const action = { operations: [operation] };

    customOnChangeHandler(action, handler);

    expect(handler).toHaveBeenCalledWith([{ operation: 'unknownType' }]);
  });
});
