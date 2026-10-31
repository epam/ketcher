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

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'components';
import classes from './SettingsPanel.module.less';

export interface ManageSettingsMenuProps {
  onResetToDefault: () => void;
  onResetToACS: () => void;
  onSave: () => void;
  onLoad: () => void;
}

const ManageSettingsMenu = ({
  onResetToDefault,
  onResetToACS,
  onSave,
  onLoad,
}: ManageSettingsMenuProps) => {
  const { t } = useTranslation('dialogs');
  const [isOpen, setIsOpen] = useState(false);
  const [isResetSubmenuOpen, setIsResetSubmenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsResetSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const closeAll = () => {
    setIsOpen(false);
    setIsResetSubmenuOpen(false);
  };

  return (
    <div ref={menuRef} className={classes.manageSettingsMenu}>
      <button
        type="button"
        className={classes.manageSettingsButton}
        onClick={() => setIsOpen((v) => !v)}
        data-testid="manage-settings-button"
      >
        {t('meta.settings.manageSettings')}
      </button>
      {isOpen && (
        <div className={classes.manageSettingsDropdown}>
          <div
            className={classes.menuItemWithSubmenu}
            onMouseEnter={() => setIsResetSubmenuOpen(true)}
            onMouseLeave={() => setIsResetSubmenuOpen(false)}
          >
            <button
              type="button"
              className={classes.menuItem}
              data-testid="reset-to-submenu-trigger"
            >
              <span>{t('meta.settings.resetTo')}</span>
              <Icon name="chevron" className={classes.menuItemChevron} />
            </button>
            {isResetSubmenuOpen && (
              <div className={classes.submenu}>
                <button
                  type="button"
                  className={classes.menuItem}
                  onClick={() => {
                    onResetToDefault();
                    closeAll();
                  }}
                  data-testid="reset-to-default-button"
                >
                  {t('meta.settings.resetToDefault')}
                </button>
                <button
                  type="button"
                  className={classes.menuItem}
                  onClick={() => {
                    onResetToACS();
                    closeAll();
                  }}
                  data-testid="reset-to-acs-button"
                >
                  {t('meta.settings.resetToACS')}
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            className={classes.menuItem}
            onClick={() => {
              onSave();
              closeAll();
            }}
            data-testid="save-settings-menu-button"
          >
            {t('meta.settings.saveSettings')}
          </button>
          <button
            type="button"
            className={classes.menuItem}
            onClick={() => {
              onLoad();
              closeAll();
            }}
            data-testid="load-settings-menu-button"
          >
            {t('meta.settings.loadSettings')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ManageSettingsMenu;
