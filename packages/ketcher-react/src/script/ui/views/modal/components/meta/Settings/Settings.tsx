/* eslint-disable @typescript-eslint/no-explicit-any */
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

import type { BaseCallProps, BaseProps } from '../../../modal.types';
import Form, { Field } from '../../../../../component/form/form/form';
import {
  setDefaultSettings,
  updateFormState,
} from '../../../../../state/modal/form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ColorPicker from '../../../../../component/form/colorPicker/ColorPicker';
import MeasureInput from '../../../../../component/form/MeasureInput/measure-input';
import OpenButton from '../../../../../component/view/openbutton';
import { SaveButton } from '../../../../../component/view/savebutton';
import Select from '../../../../../component/form/Select';
import SettingsAccordion from './SettingsAccordion';
import SettingsPanel from './SettingsPanel';
import { type StructService, KetcherLogger } from 'ketcher-core';
import SystemFonts from '../../../../../component/form/systemfonts';
import classes from './Settings.module.less';
import appClasses from '../../../../../App/App.module.less';
import { connect } from 'react-redux';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { saveSettings } from '../../../../../state/options';
import settingsSchema, {
  getDefaultOptions,
} from '../../../../../data/schema/options-schema';
import { isEqual } from 'lodash';
import { Icon } from 'components';
import {
  ACS_STYLE_DEFAULT_SETTINGS,
  KETCHER_ROOT_NODE_CSS_SELECTOR,
} from 'src/constants';
import { onAction } from 'src/script/ui/state/shared';
import i18n from 'src/i18n/i18n';

interface SettingsProps extends BaseProps {
  ketcherId: string;
  initState: any;
  appOpts: {
    version: string;
    buildDate: string;
    buildNumber: string;
    indigoVersion: string;
    imagoVersions: Array<string>;
    server: boolean;
    templates: boolean;
  };
  server: StructService;
}

interface SettingsCallProps extends BaseCallProps {
  onOpenFile: (any) => void;
  onReset: () => void;
  onACSStyle: (result) => void;
}

type SettingsOwnProps = Pick<SettingsProps, 'ketcherId'> &
  Pick<BaseCallProps, 'onOk'>;

const defaultSettings = getDefaultOptions();

const HeaderControls = ({
  server,
  onOpenFile,
  onReset,
  onACSStyle,
  formState,
  initState,
}) => {
  const { t } = useTranslation('dialogs');
  const getIsResetDisabled = () => {
    if (formState.result.init) return isEqual(defaultSettings, initState);
    else return isEqual(defaultSettings, formState.result);
  };

  return (
    <>
      <button
        className={classes.acsStyleButton}
        key="acsstylebutton"
        onClick={onACSStyle}
        title={t('meta.settings.setAcsSettings')}
        data-testid="acs-style-button"
      >
        {t('meta.settings.setAcsSettings')}
      </button>
      <OpenButton
        title={t('meta.settings.openFromFile')}
        key="settings"
        server={server}
        onLoad={onOpenFile}
        className={classes.button}
        data-testid="open-settings-from-file-button"
      >
        <Icon name="open-1" />
      </OpenButton>
      <SaveButton
        title={t('meta.settings.saveToFile')}
        key="ketcher-settings"
        data={JSON.stringify(formState.result)}
        filename="ketcher-settings"
        className={classes.button}
        testId="save-settings-to-file-button"
      >
        <Icon name="save-1" />
      </SaveButton>
      <button
        title={t('meta.settings.reset')}
        key="settings-button"
        onClick={onReset}
        className={classes.button}
        data-testid="reset-settings-button"
        disabled={getIsResetDisabled()}
      >
        <Icon name="reset" />
      </button>
    </>
  );
};

type Props = SettingsProps & SettingsCallProps;

const settingsProps = settingsSchema.properties;

const SettingsDialog = (props: Props) => {
  const { t } = useTranslation(['common', 'dialogs', 'settings']);
  const {
    initState,
    formState,
    server,
    onOpenFile,
    onReset,
    appOpts,
    ...prop
  } = props;

  // The panel is clamped inside the canvas area, so it never covers a toolbar.
  // The canvas is mounted long before any dialog can open, so it is resolved once
  // on the first render rather than from an effect.
  const [boundsElement] = useState<HTMLElement | null>(() =>
    document.querySelector<HTMLElement>(
      `${KETCHER_ROOT_NODE_CSS_SELECTOR} .${appClasses.canvas}`,
    ),
  );

  const atomsTab = {
    key: 'atoms',
    label: t('dialogs:meta.settings.atomsTab'),
    content: (
      <fieldset>
        <Field name="carbonExplicitly" data-testid="carbon-explicitly" />
        <Field name="showCharge" data-testid="show-charge" />
        <Field name="showValence" data-testid="show-valence" />
        <Field
          name="showHydrogenLabels"
          component={Select}
          options={getSelectOptionsFromSchema(
            settingsProps?.showHydrogenLabels,
            t,
          )}
          data-testid="show-hydrogen-labels"
        />
        <Field name="atomColoring" data-testid="atom-coloring" />
      </fieldset>
    ),
  };
  const bondsTab = {
    key: 'bonds',
    label: t('dialogs:meta.settings.bondsTab'),
    content: (
      <fieldset>
        <Field name="aromaticCircle" data-testid="aromatic-circle" />
        <Field
          name="bondLength"
          component={MeasureInput}
          labelPos={false}
          extraName="bondLengthUnit"
        />
        <Field
          name="bondSpacing"
          hint={t('settings:fields.bondSpacing.extraLabel')}
        />
        <Field
          name="bondThickness"
          component={MeasureInput}
          labelPos={false}
          extraName="bondThicknessUnit"
        />
        <Field
          name="stereoBondWidth"
          component={MeasureInput}
          labelPos={false}
          extraName="stereoBondWidthUnit"
        />
        <Field
          name="hashSpacing"
          hint={t('dialogs:meta.settings.hashSpacingTooltip')}
          component={MeasureInput}
          labelPos={false}
          extraName="hashSpacingUnit"
        />
      </fieldset>
    ),
  };
  const stereoTab = {
    key: 'stereo',
    label: t('dialogs:meta.settings.stereochemistryTab'),
    content: (
      <fieldset>
        <Field
          name="showStereoFlags"
          hint={t('dialogs:meta.settings.showStereoFlagsTooltip')}
          data-testid="show-stereo-flags"
        />
        <Field
          name="stereoLabelStyle"
          hint={t('dialogs:meta.settings.stereoLabelStyleTooltip')}
          component={Select}
          options={getSelectOptionsFromSchema(
            settingsProps?.stereoLabelStyle,
            t,
          )}
          data-testid="stereo-label-style"
        />
        <Field
          name="colorOfAbsoluteCenters"
          hint={t('dialogs:meta.settings.colorOfAbsoluteCentersTooltip')}
          component={ColorPicker}
          data-testid="color-of-absolute-centers"
        />
        <Field
          name="colorOfAndCenters"
          hint={t('dialogs:meta.settings.colorOfAndCentersTooltip')}
          component={ColorPicker}
          data-testid="color-of-and-centers"
        />
        <Field
          name="colorOfOrCenters"
          hint={t('dialogs:meta.settings.colorOfOrCentersTooltip')}
          component={ColorPicker}
          data-testid="color-of-or-centers"
        />
        <Field
          name="colorStereogenicCenters"
          component={Select}
          options={getSelectOptionsFromSchema(
            settingsProps?.colorStereogenicCenters,
            t,
          )}
          data-testid="color-stereogenic-centers"
        />
        <Field
          name="autoFadeOfStereoLabels"
          hint={t('dialogs:meta.settings.autoFadeOfStereoLabelsTooltip')}
          data-testid="auto-fade-of-stereo-labels"
        />
        <Field name="absFlagLabel" data-testid="abs-flag-label" />
        <Field name="andFlagLabel" data-testid="and-flag-label" />
        <Field name="orFlagLabel" data-testid="or-flag-label" />
        <Field name="mixedFlagLabel" data-testid="mixed-flag-label" />
        <Field
          name="ignoreChiralFlag"
          hint={t('dialogs:meta.settings.ignoreChiralFlagTooltip')}
          data-testid="ignore-chiral-flag"
        />
      </fieldset>
    ),
  };
  const reactionsTab = {
    key: 'reactions',
    label: t('dialogs:meta.settings.reactionsTab'),
    content: (
      <fieldset>
        <Field
          name="reactionComponentMarginSize"
          hint={t('dialogs:meta.settings.reactionComponentMarginSizeTooltip')}
          component={MeasureInput}
          labelPos={false}
          extraName="reactionComponentMarginSizeUnit"
        />
        <fieldset disabled={!appOpts.server}>
          <Field
            name="gross-formula-add-rsites"
            data-testid="gross-formula-add-rsites"
          />
          <Field
            name="gross-formula-add-isotopes"
            data-testid="gross-formula-add-isotopes"
          />
        </fieldset>
      </fieldset>
    ),
  };
  const generalTab = {
    key: 'general',
    label: t('dialogs:meta.settings.generalTab'),
    content: (
      <fieldset>
        <Field
          name="resetToSelect"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.resetToSelect, t)}
          data-testid="reset-to-select"
        />
        <Field
          name="rotationStep"
          hint={t('dialogs:meta.settings.rotationStepTooltip')}
          data-testid="rotation-step"
        />
        <Field
          name="font"
          component={SystemFonts}
          data-testid="font-selection"
        />
        <Field
          name="fontsz"
          component={MeasureInput}
          labelPos={false}
          extraName="fontszUnit"
        />
        <Field
          name="fontszsub"
          component={MeasureInput}
          labelPos={false}
          extraName="fontszsubUnit"
        />
        <Field
          name="imageResolution"
          hint={t('dialogs:meta.settings.imageResolutionTooltip')}
          component={Select}
          options={getSelectOptionsFromSchema(
            settingsProps?.imageResolution,
            t,
          )}
          data-testid="image-resolution"
        />
        <Field
          name="miewMode"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.miewMode, t)}
          data-testid="display-mode"
        />
        <Field
          name="miewTheme"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.miewTheme, t)}
          data-testid="background-color"
        />
        <Field
          name="miewAtomLabel"
          component={Select}
          options={getSelectOptionsFromSchema(settingsProps?.miewAtomLabel, t)}
          data-testid="label-coloring"
        />
      </fieldset>
    ),
  };
  const validationTab = {
    key: 'validation',
    label: t('dialogs:meta.settings.validationTab'),
    content: (
      <fieldset>
        <Field
          name="showValenceWarnings"
          hint={t('dialogs:meta.settings.showValenceWarningsTooltip')}
          data-testid="show-valence-warnings"
        />
        <fieldset disabled={!appOpts.server}>
          <Field
            name="ignore-stereochemistry-errors"
            hint={t('dialogs:meta.settings.ignoreStereochemistryErrorsTooltip')}
            data-testid="ignore-stereochemistry-errors"
          />
          <Field
            name="mass-skip-error-on-pseudoatoms"
            data-testid="mass-skip-error-on-pseudoatoms"
          />
        </fieldset>
      </fieldset>
    ),
  };
  const debuggingTab = {
    key: 'debugging',
    label: t('dialogs:meta.settings.debuggingTab'),
    content: (
      <fieldset>
        <fieldset disabled={!appOpts.server}>
          <Field
            name="smart-layout"
            hint={t('dialogs:meta.settings.smartLayoutTooltip')}
            data-testid="smart-layout"
          />
        </fieldset>
        <Field
          name="showAtomIds"
          hint={t('dialogs:meta.settings.showAtomIdsTooltip')}
          data-testid="show-atom-ids"
        />
        <Field
          name="showBondIds"
          hint={t('dialogs:meta.settings.showBondIdsTooltip')}
          data-testid="show-bond-ids"
        />
        <Field
          name="showHalfBondIds"
          hint={t('dialogs:meta.settings.showHalfBondIdsTooltip')}
          data-testid="show-half-bond-ids"
        />
        <Field
          name="showLoopIds"
          hint={t('dialogs:meta.settings.showLoopIdsTooltip')}
          data-testid="show-loop-ids"
        />
      </fieldset>
    ),
  };

  const onACSStyle = () => {
    prop.onACSStyle({
      ...formState.result,
      ...ACS_STYLE_DEFAULT_SETTINGS,
    });
  };

  const tabs = [
    atomsTab,
    bondsTab,
    stereoTab,
    reactionsTab,
    generalTab,
    validationTab,
    debuggingTab,
  ];

  // Apply commits the staged form result; Cancel and the close button discard it by
  // closing the dialog without touching `options.settings`.
  const handleApply = () => {
    if (!formState.valid) return;
    prop.onOk?.([formState.result, initState]);
  };

  return (
    <SettingsPanel
      className={prop.className}
      title={t('dialogs:meta.settings.headerTitle')}
      boundsElement={boundsElement}
      isApplyDisabled={!formState.valid}
      onApply={handleApply}
      onCancel={prop.onCancel}
      onClose={prop.onCancel}
      headerControls={
        <HeaderControls
          server={server}
          onOpenFile={onOpenFile}
          onReset={onReset}
          onACSStyle={onACSStyle}
          formState={formState}
          initState={initState}
        />
      }
    >
      <Form schema={settingsSchema} init={initState} {...formState}>
        <SettingsAccordion groups={tabs} className={classes.accordion} />
      </Form>
    </SettingsPanel>
  );
};

const mapStateToProps = (state) => ({
  server: state.options.app.server ? state.server : null,
  appOpts: state.options.app,
  initState: state.options.settings,
  formState: state.modal.form,
});

const mapDispatchToProps = (dispatch, ownProps: SettingsOwnProps) => ({
  onOpenFile: (newOpts) => {
    try {
      dispatch(updateFormState({ result: JSON.parse(newOpts) }));
    } catch (e) {
      KetcherLogger.error('Settings.tsx::mapDispatchToProps', e);
      console.info('Bad file');
    }
  },
  onReset: () => dispatch(setDefaultSettings()),
  onOk: (res) => {
    const [result, initState] = res;

    dispatch(saveSettings(result, ownProps.ketcherId));
    ownProps.onOk(result);

    const showNotification =
      initState.reactionComponentMarginSize !==
      result.reactionComponentMarginSize;

    if (showNotification) {
      dispatch(
        onAction({
          dialog: 'info-modal',
          prop: {
            title: '',
            customText: i18n.t('dialogs:meta.settings.applyLayoutNotice'),
            button: 'OK',
          },
        }),
      );
    }
  },
  onACSStyle: (result) => {
    dispatch(updateFormState({ result }));
  },
});

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsDialog);

export default Settings;
