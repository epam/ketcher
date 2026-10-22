/* eslint-disable react-hooks/set-state-in-effect */
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

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  KetcherLogger,
  normalizeSettingsForCore,
  normalizeSettingsForForm,
  SettingsFormValue,
} from 'ketcher-core';
import { Icon, SettingsPanel } from 'ketcher-react';
import { RequiredModalProps } from '../modalContainer';
import { MACROMOLECULES_MAIN_AREA_TEST_ID } from 'components/Layout/Layout';
import { SettingsFieldControl } from './SettingsFieldControl';
import {
  SETTINGS_FIELD_GROUPS,
  type SettingFieldValue,
} from './settingsFields';
import {
  CanvasCaptureLayer,
  HeaderIconButton,
  HeaderTextButton,
} from './Settings.styles';

/**
 * Thin adapter between the shared presentational panel from ketcher-react and
 * `SettingsService`: it stages the service's values locally and only writes them
 * back on Apply. It deliberately does not wrap itself in `shared/modal`'s Modal,
 * which is what keeps the macro canvas visible and undimmed.
 */
export const SettingsPanelAdapter = ({
  isModalOpen,
  onClose,
}: RequiredModalProps) => {
  const { t } = useTranslation(['common', 'dialogs', 'macromoleculesDialogs']);
  const settingsService = window.ketcher?.settingsService;

  const [currentSettings, setCurrentSettings] =
    useState<SettingsFormValue | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // The panel is clamped inside the canvas area and portalled into it, so it can
  // never cover the top toolbar, the left menu or the monomer library.
  const [boundsElement] = useState<HTMLElement | null>(() =>
    document.querySelector<HTMLElement>(
      `[data-testid="${MACROMOLECULES_MAIN_AREA_TEST_ID}"]`,
    ),
  );

  useEffect(() => {
    if (!settingsService || !isModalOpen) return;

    const coreSettings = settingsService.getSettings();
    const formSettings = normalizeSettingsForForm(coreSettings);
    setCurrentSettings(formSettings);

    return settingsService.subscribe((newCoreSettings) => {
      setCurrentSettings(normalizeSettingsForForm(newCoreSettings));
    });
  }, [settingsService, isModalOpen]);

  const handleFieldChange = (name: string, value: SettingFieldValue) => {
    setCurrentSettings((previous) =>
      previous ? { ...previous, [name]: value } : null,
    );
  };

  const handleApply = async () => {
    if (!settingsService || !currentSettings) return;

    setIsLoading(true);
    try {
      await settingsService.updateSettings(
        normalizeSettingsForCore(currentSettings),
      );
      onClose();
    } catch (error) {
      KetcherLogger.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!settingsService) return;

    setIsLoading(true);
    try {
      const formDefaults = normalizeSettingsForForm(
        await settingsService.resetToDefaults(),
      );
      setCurrentSettings(formDefaults);
    } catch (error) {
      KetcherLogger.error('Failed to reset settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleACSStyle = async () => {
    if (!settingsService) return;

    setIsLoading(true);
    try {
      await settingsService.loadPreset('acs');
      setCurrentSettings(
        normalizeSettingsForForm(settingsService.getSettings()),
      );
    } catch (error) {
      KetcherLogger.error('Failed to apply ACS style:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file || !settingsService) return;

      setIsLoading(true);
      try {
        await settingsService.importSettings(await file.text());
      } catch (error) {
        KetcherLogger.error('Failed to import settings:', error);
        // eslint-disable-next-line no-alert
        alert(
          t('macromoleculesDialogs:settings.importFailed', {
            message: error instanceof Error ? error.message : String(error),
          }),
        );
      } finally {
        setIsLoading(false);
      }
    };

    input.click();
  };

  const handleExport = () => {
    if (!settingsService) return;

    try {
      const blob = new Blob([settingsService.exportSettings()], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ketcher-settings-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      KetcherLogger.error('Failed to export settings:', error);
      // eslint-disable-next-line no-alert
      alert(t('macromoleculesDialogs:settings.exportFailed'));
    }
  };

  if (!currentSettings || !boundsElement) {
    return null;
  }

  const groups = SETTINGS_FIELD_GROUPS.map((group) => ({
    key: group.id,
    label: t(group.titleKey),
    content: (
      <>
        {group.fields.map((field) => (
          <SettingsFieldControl
            key={field.name}
            field={field}
            value={currentSettings[field.name] as SettingFieldValue | undefined}
            unitValue={
              field.unitName
                ? (currentSettings[field.unitName] as SettingFieldValue)
                : undefined
            }
            onChange={(value) => handleFieldChange(field.name, value)}
            onUnitChange={
              field.unitName
                ? (value) => handleFieldChange(field.unitName as string, value)
                : undefined
            }
          />
        ))}
      </>
    ),
  }));

  const headerControls = (
    <>
      <HeaderTextButton
        onClick={handleACSStyle}
        disabled={isLoading}
        title={t('dialogs:meta.settings.setAcsSettings')}
        data-testid="acs-style-button"
      >
        {t('dialogs:meta.settings.setAcsSettings')}
      </HeaderTextButton>
      <HeaderIconButton
        onClick={handleImport}
        disabled={isLoading}
        title={t('dialogs:meta.settings.openFromFile')}
        data-testid="open-settings-from-file-button"
      >
        <Icon name="open-1" />
      </HeaderIconButton>
      <HeaderIconButton
        onClick={handleExport}
        disabled={isLoading}
        title={t('dialogs:meta.settings.saveToFile')}
        data-testid="save-settings-to-file-button"
      >
        <Icon name="save-1" />
      </HeaderIconButton>
      <HeaderIconButton
        onClick={handleReset}
        disabled={isLoading}
        title={t('dialogs:meta.settings.reset')}
        data-testid="reset-settings-button"
      >
        <Icon name="reset" />
      </HeaderIconButton>
    </>
  );

  return createPortal(
    <>
      {/* Transparent, so the canvas stays fully visible but cannot be modified */}
      <CanvasCaptureLayer data-testid="settings-canvas-capture-layer" />
      <SettingsPanel
        title={t('dialogs:meta.settings.headerTitle')}
        headerControls={headerControls}
        groups={groups}
        boundsElement={boundsElement}
        isApplyDisabled={isLoading}
        onApply={handleApply}
        onCancel={onClose}
        onClose={onClose}
      />
    </>,
    boundsElement,
  );
};
