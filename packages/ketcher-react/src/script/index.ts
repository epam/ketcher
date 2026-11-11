/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import type { Root } from 'react-dom/client';
import { type ButtonsConfig, KetcherBuilder } from './builders';

import type {
  StructServiceProvider,
  DisabledFunctionalityConfig,
} from 'ketcher-core';
import type { CustomButton } from './builders/ketcher/CustomButtons';

interface Config {
  element: HTMLDivElement | null;
  appRoot: Root;
  staticResourcesUrl: string;
  structServiceProvider: StructServiceProvider;
  buttons?: ButtonsConfig;
  customButtons?: Array<CustomButton>;
  errorHandler: (message: string) => void;
  togglerComponent?: JSX.Element;
  ketcherId: string;
  /**
   * List of Ketcher functionality to disable across all of their UI entry
   * points (context menu items, toolbar buttons, etc). See
   * `KetcherFunctionality` for the available values.
   */
  disabledFunctionality?: DisabledFunctionalityConfig;
}

export type { Config };
export type { ButtonsConfig } from './builders';
export * from './providers';

async function buildKetcherAsync({
  element,
  appRoot,
  staticResourcesUrl,
  structServiceProvider,
  buttons,
  errorHandler,
  togglerComponent,
  customButtons,
  disabledFunctionality,
  ketcherId: prevKetcherId,
}: Config) {
  const builder = new KetcherBuilder();

  const structService = builder.appendApiAsync(structServiceProvider);
  builder.appendServiceMode(structServiceProvider.mode);
  builder.withDisabledFunctionality(disabledFunctionality ?? []);
  const ketcher = await builder.build();
  structService.addKetcherId(ketcher.id);

  const { cleanup: uiCleanup, setServer } = await builder.appendUiAsync(
    prevKetcherId,
    ketcher.id,
    element,
    appRoot,
    staticResourcesUrl,
    errorHandler,
    buttons,
    togglerComponent,
    customButtons,
  );

  const cleanup = () => {
    uiCleanup?.();
    structService.destroy?.();
  };

  return { ketcher, cleanup, builder, setServer };
}

export default buildKetcherAsync;

export * from './ui/views/toolbars/ArrowScroll';
export * from './ui/views/toolbars/ToolbarGroupItem/ToolbarMultiToolItem/usePortalStyle';
