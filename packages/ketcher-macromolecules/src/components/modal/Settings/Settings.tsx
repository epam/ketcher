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

import { useState, useEffect, useMemo } from 'react';
import { Modal } from 'components/shared/modal';
import { ActionButton } from 'components/shared/actionButton';
import { SettingsAccordion } from './SettingsAccordion';
import { Settings as SettingsType } from 'ketcher-core';
import { RequiredModalProps } from '../modalContainer';
import {
  Container,
  FooterLeft,
  FooterRight,
  HeaderContent,
  HeaderButton,
  HeaderTitle,
} from './Settings.styles';
import { Icon } from 'ketcher-react';

export const Settings = ({ isModalOpen, onClose }: RequiredModalProps) => {
  const settingsService = window.ketcher?.settingsService;

  const [currentSettings, setCurrentSettings] = useState<SettingsType | null>(
    null,
  );
  const [initialSettings, setInitialSettings] = useState<SettingsType | null>(
    null,
  );
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['general']);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!settingsService || !isModalOpen) return;

    const settings = settingsService.getSettings();
    setCurrentSettings(settings);
    setInitialSettings(settings);

    const unsubscribe = settingsService.subscribe((newSettings) => {
      setCurrentSettings(newSettings);
    });

    return unsubscribe;
  }, [settingsService, isModalOpen]);

  const hasChanges = useMemo(() => {
    if (!currentSettings || !initialSettings) return false;
    return JSON.stringify(currentSettings) !== JSON.stringify(initialSettings);
  }, [currentSettings, initialSettings]);

  const handleSettingsChange = (partial: Partial<SettingsType>) => {
    setCurrentSettings((prev) => (prev ? { ...prev, ...partial } : null));
  };

  const handleGroupToggle = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleApply = async () => {
    if (!settingsService || !currentSettings) return;

    setIsLoading(true);
    try {
      await settingsService.updateSettings(currentSettings);
      setInitialSettings(currentSettings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!settingsService) return;

    if (!window.confirm('Reset all settings to defaults?')) return;

    setIsLoading(true);
    try {
      const defaults = await settingsService.resetToDefaults();
      setCurrentSettings(defaults);
      setInitialSettings(defaults);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!window.confirm('Discard changes?')) return;
    }
    onClose();
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !settingsService) return;

      setIsLoading(true);
      try {
        const text = await file.text();
        await settingsService.importSettings(text);
      } catch (error) {
        console.error('Failed to import settings:', error);
        alert(
          `Import failed: ${
            error instanceof Error ? error.message : String(error)
          }`,
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
      const json = settingsService.exportSettings();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ketcher-settings-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export settings:', error);
      alert('Export failed');
    }
  };

  if (!currentSettings) {
    return null;
  }

  const handleACSStyle = async () => {
    if (!settingsService) return;

    setIsLoading(true);
    try {
      // Type assertion needed as loadPreset may not be in the type definition yet
      await (settingsService as any).loadPreset('acs');
      const acsSettings = settingsService.getSettings();
      setCurrentSettings(acsSettings);
    } catch (error) {
      console.error('Failed to apply ACS style:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const headerTitle = (
    <HeaderContent>
      <HeaderTitle>Settings</HeaderTitle>
      <HeaderButton
        onClick={handleImport}
        disabled={isLoading}
        title="Open from File"
        data-testid="open-settings-from-file-button"
      >
        <Icon name="open-1" />
      </HeaderButton>
      <HeaderButton
        onClick={handleExport}
        disabled={isLoading}
        title="Save to File"
        data-testid="save-settings-to-file-button"
      >
        <Icon name="save-1" />
      </HeaderButton>
      <HeaderButton
        onClick={handleReset}
        disabled={isLoading}
        title="Reset"
        data-testid="reset-settings-button"
      >
        <Icon name="reset" />
      </HeaderButton>
    </HeaderContent>
  );

  return (
    <Modal
      title={headerTitle as any}
      isOpen={isModalOpen}
      onClose={handleCancel}
      showExpandButton={true}
      testId="settings-modal"
    >
      <Modal.Content>
        <Container>
          <SettingsAccordion
            settings={currentSettings}
            onChange={handleSettingsChange}
            expandedGroups={expandedGroups}
            onGroupToggle={handleGroupToggle}
          />
        </Container>
      </Modal.Content>

      <Modal.Footer>
        <FooterLeft>
          <ActionButton
            label="Set ACS Settings"
            styleType="secondary"
            clickHandler={handleACSStyle}
            disabled={isLoading}
            data-testid="acs-style-button"
          />
        </FooterLeft>
        <FooterRight>
          <ActionButton
            label="Cancel"
            styleType="secondary"
            clickHandler={handleCancel}
            disabled={isLoading}
          />
          <ActionButton
            label="Apply"
            clickHandler={handleApply}
            disabled={!hasChanges || isLoading}
          />
        </FooterRight>
      </Modal.Footer>
    </Modal>
  );
};
