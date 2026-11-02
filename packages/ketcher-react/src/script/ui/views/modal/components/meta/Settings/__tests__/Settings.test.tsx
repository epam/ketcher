/****************************************************************************
 * Copyright 2026 EPAM Systems
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

import { fireEvent, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import i18n from 'src/i18n/i18n';
import { getDefaultOptions } from 'src/script/ui/data/schema/options-schema';
import Settings from '../Settings';

jest.mock('src/i18n/i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
    changeLanguage: jest.fn(),
    t: (key: string) => key,
  },
  SUPPORTED_LANGUAGES: [
    { code: 'en', label: 'English' },
    { code: 'zh-CN', label: '简体中文' },
  ],
}));

const initState = getDefaultOptions();

const testI18n = createInstance();

beforeAll(async () => {
  await testI18n.init({
    lng: 'en',
    resources: { en: { translation: {} } },
  });
});

const createTestStore = () =>
  createStore(() => ({
    options: {
      app: {
        server: false,
        version: 'test',
        buildDate: '',
        buildNumber: '',
        indigoVersion: '',
        imagoVersions: [],
        templates: false,
      },
      settings: initState,
    },
    modal: {
      form: {
        result: initState,
        valid: true,
        errors: {},
        onUpdate: jest.fn(),
      },
    },
    server: null,
  }));

const renderSettings = () =>
  render(
    <I18nextProvider i18n={testI18n}>
      <Provider store={createTestStore()}>
        <Settings
          className=""
          ketcherId="settings-language-test"
          onOk={jest.fn()}
          onCancel={jest.fn()}
        />
      </Provider>
    </I18nextProvider>,
  );

describe('Settings language selector', () => {
  beforeEach(() => {
    (i18n.changeLanguage as jest.Mock).mockClear();
  });

  it('renders the language selector when more than one language is available', () => {
    renderSettings();

    expect(screen.getByTestId('language-select')).toBeInTheDocument();
  });

  it('changes the active language when another option is selected', () => {
    renderSettings();

    const languageSelect = screen.getByTestId('language-select');
    const combobox = languageSelect.querySelector('[role="combobox"]');
    expect(combobox).not.toBeNull();
    fireEvent.mouseDown(combobox as HTMLElement);
    fireEvent.click(screen.getByTestId('简体中文-option'));

    expect(i18n.changeLanguage).toHaveBeenCalledWith('zh-CN');
  });
});
