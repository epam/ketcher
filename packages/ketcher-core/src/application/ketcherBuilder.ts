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
  StructService,
  StructServiceOptions,
  StructServiceProvider,
} from 'domain/services';

import { FormatterFactory } from 'application/formatters';
import { Ketcher } from './ketcher';
import assert from 'assert';
import { ketcherProvider } from './utils';
import type {
  ISettingsService,
  ISettingsStorage,
  Settings,
  DeepPartial,
} from 'application/settings';
import { SettingsService, LocalStorageAdapter } from 'application/settings';

export const DefaultStructServiceOptions = {
  'smart-layout': true,
  'ignore-stereochemistry-errors': true,
  'mass-skip-error-on-pseudoatoms': false,
  'gross-formula-add-rsites': true,
  'aromatize-skip-superatoms': true,
  'dearomatize-on-load': false,
  'ignore-no-chiral-flag': false,
};

export class KetcherBuilder {
  #structServiceProvider?: StructServiceProvider;
  #settingsService?: ISettingsService;
  #storageAdapter?: ISettingsStorage;
  #initialSettings?: DeepPartial<Settings>;

  withStructServiceProvider(
    structServiceProvider: StructServiceProvider,
  ): this {
    this.#structServiceProvider = structServiceProvider;
    return this;
  }

  /**
   * Provide a custom settings service instance
   * If not provided, a default SettingsService will be created
   */
  withSettingsService(settingsService: ISettingsService): this {
    this.#settingsService = settingsService;
    return this;
  }

  /**
   * Provide a custom storage adapter for settings
   * Default is LocalStorageAdapter
   */
  withStorageAdapter(storageAdapter: ISettingsStorage): this {
    this.#storageAdapter = storageAdapter;
    return this;
  }

  /**
   * Provide initial settings to merge with defaults
   * These will be applied when the settings service is initialized
   */
  withSettings(settings: DeepPartial<Settings>): this {
    this.#initialSettings = settings;
    return this;
  }

  async build(serviceOptions?: StructServiceOptions): Promise<Ketcher> {
    assert(this.#structServiceProvider != null);

    const mergedServiceOptions: StructServiceOptions = {
      ...DefaultStructServiceOptions,
      ...serviceOptions,
    };
    const structService: StructService =
      this.#structServiceProvider!.createStructService(mergedServiceOptions);

    // Initialize settings service if not provided
    let settingsService = this.#settingsService;
    if (!settingsService) {
      settingsService = new SettingsService({
        storage: this.#storageAdapter || new LocalStorageAdapter(),
        defaults: this.#initialSettings,
        autoSave: true,
        migrateOnLoad: true,
      });

      // Initialize the settings service
      await settingsService.init();
    }

    const ketcher = new Ketcher(
      structService,
      new FormatterFactory(structService),
      settingsService,
    );
    structService.addKetcherId(ketcher.id);
    ketcher[this.#structServiceProvider.mode] = true;

    ketcherProvider.addKetcherInstance(ketcher);
    return ketcher;
  }
}
