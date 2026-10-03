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

import type { Struct, Serializer } from 'ketcher-core';
import type Editor from '../../editor/Editor';

/**
 * Supported serialization format types for structure copying.
 */
export type SerializationType = 'mol' | 'ket';

/**
 * Error handler function that accepts error messages.
 */
export type ErrorHandler = (message: string) => void;

/**
 * Editor with error handler capability.
 */
export interface EditorWithErrorHandler extends Editor {
  errorHandler: ErrorHandler;
}

/**
 * Global application state containing editor and other configuration.
 */
export interface CurrentState {
  editor: EditorWithErrorHandler;
  options?: {
    settings?: Record<string, unknown>;
  };
  server?: unknown;
  [key: string]: unknown;
}

/**
 * Serializer for a Struct type.
 */
export type StructSerializer = Serializer<Struct>;
