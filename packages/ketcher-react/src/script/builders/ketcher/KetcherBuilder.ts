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

import {
  DefaultStructServiceOptions,
  FormatterFactory,
  Ketcher,
  ServiceMode,
  StructService,
  StructServiceProvider,
  ketcherProvider,
  KetcherLogger,
  SettingsService,
  LocalStorageAdapter,
  type ISettingsService,
  type ISettingsStorage,
  type Settings,
  type DeepPartial,
} from 'ketcher-core';

import { ButtonsConfig } from './ButtonsConfig';
import { Editor } from '../../editor';
import createApi from '../../api';
import { initApp } from '../../ui';
import { Root } from 'react-dom/client';
import { IndigoProvider } from 'src/script/providers';
import { STRUCT_SERVICE_INITIALIZED_EVENT } from '../../../constants';
import { CustomButton } from './CustomButtons';

class KetcherBuilder {
  private structService: StructService | null;
  private serviceMode: ServiceMode | null;
  private formatterFactory: FormatterFactory | null;
  private settingsService: ISettingsService | null;
  private storageAdapter: ISettingsStorage | null;
  private initialSettings: DeepPartial<Settings> | null;

  constructor() {
    this.structService = null;
    this.serviceMode = null;
    this.formatterFactory = null;
    this.settingsService = null;
    this.storageAdapter = null;
    this.initialSettings = null;
  }

  /**
   * Provide a custom settings service instance
   * If not provided, a default SettingsService will be created
   */
  withSettingsService(settingsService: ISettingsService): this {
    this.settingsService = settingsService;
    return this;
  }

  /**
   * Provide a custom storage adapter for settings
   * Default is LocalStorageAdapter
   */
  withStorageAdapter(storageAdapter: ISettingsStorage): this {
    this.storageAdapter = storageAdapter;
    return this;
  }

  /**
   * Provide initial settings to merge with defaults
   * These will be applied when the settings service is initialized
   */
  withSettings(settings: DeepPartial<Settings>): this {
    this.initialSettings = settings;
    return this;
  }

  appendApiAsync(structServiceProvider: StructServiceProvider) {
    const structService = createApi(
      structServiceProvider,
      DefaultStructServiceOptions,
    );
    this.structService = structService;
    this.formatterFactory = new FormatterFactory(structService);
    return structService;
  }

  reinitializeApi(
    ketcherId: string,
    structServiceProvider: StructServiceProvider,
    setStructServiceToStore: (structService: StructService) => void,
  ) {
    const oldStructService = this.structService;

    this.structService = createApi(
      structServiceProvider,
      DefaultStructServiceOptions,
    );
    this.structService.addKetcherId(ketcherId);

    window.addEventListener(
      STRUCT_SERVICE_INITIALIZED_EVENT,
      () => {
        oldStructService?.destroy?.();

        if (!this.structService) {
          KetcherLogger.warn('Structure service is not reinitialized');

          return;
        }

        const ketcher = ketcherProvider.getKetcher(ketcherId);
        ketcher.reinitializeIndigo(this.structService);
        IndigoProvider.setIndigo(this.structService);
        setStructServiceToStore(this.structService);
      },
      { once: true },
    );

    return this.structService;
  }

  appendServiceMode(mode: ServiceMode) {
    this.serviceMode = mode;
  }

  async appendUiAsync(
    prevKetcherId: string,
    ketcherId: string,
    element: HTMLDivElement | null,
    appRoot: Root,
    staticResourcesUrl: string,
    errorHandler: (message: string) => void,
    buttons?: ButtonsConfig,
    togglerComponent?: JSX.Element,
    customButtons?: Array<CustomButton>,
  ): Promise<{
    cleanup: ReturnType<typeof initApp> | null;
    setServer: (structService: StructService) => void;
  }> {
    const { structService } = this;
    if (!structService) {
      throw new Error('You should append Api before initializing UI');
    }
    let cleanup: ReturnType<typeof initApp> | null = null;

    const { editor, setServer } = await new Promise<{
      editor: Editor;
      setServer: (structService: StructService) => void;
    }>((resolve) => {
      cleanup = initApp(
        prevKetcherId,
        ketcherId,
        element,
        appRoot,
        staticResourcesUrl,
        {
          buttons: buttons || {},
          errorHandler: errorHandler || null,
          version: process.env.VERSION || '',
          buildDate: process.env.BUILD_DATE || '',
          buildNumber: process.env.BUILD_NUMBER || '',
          customButtons: customButtons || [],
        },
        structService,
        resolve,
        togglerComponent,
      );
    });

    editor.errorHandler =
      errorHandler && typeof errorHandler === 'function'
        ? errorHandler
        : // eslint-disable-next-line @typescript-eslint/no-empty-function
          () => {};

    return { cleanup, setServer };
  }

  async build(): Promise<Ketcher> {
    if (!this.serviceMode) {
      throw new Error('You should append ServiceMode before building');
    }

    if (!this.structService) {
      throw new Error('You should append Api before building');
    }

    if (!this.formatterFactory) {
      throw new Error(
        'You should append StructureServiceFactory before building',
      );
    }

    // Get settings service - use singleton pattern via SettingsService.getInstance()
    let settingsService = this.settingsService;
    if (!settingsService) {
      // Use singleton pattern - getInstance() will create the instance only once
      // and reuse it on subsequent calls (see SettingsService for details)
      settingsService = await SettingsService.getInstance({
        storage: this.storageAdapter || new LocalStorageAdapter(),
        defaults: this.initialSettings || undefined,
        autoSave: true,
        migrateOnLoad: true,
      });
    }

    const ketcher = new Ketcher(
      this.structService,
      this.formatterFactory,
      settingsService,
    );
    ketcher[this.serviceMode] = true;

    const userInput = document.location.search;
    if (
      userInput === '__proto__' ||
      userInput === 'constructor' ||
      userInput === 'prototype'
    ) {
      return ketcher;
    }
    const params = new URLSearchParams(document.location.search);
    const initialMol = params.get('moll');
    if (initialMol) {
      ketcher.setMolecule(initialMol);
    }

    IndigoProvider.setIndigo(this.structService);
    ketcherProvider.addKetcherInstance(ketcher);
    return ketcher;
  }
}

export { KetcherBuilder };
