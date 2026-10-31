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

import type { BaseCallProperties, BaseProperties } from '../../../modal.types';
import Form, { Field } from '../../../../../component/form/form/form';
import {
  setDefaultSettings,
  updateFormState,
} from '../../../../../state/modal/form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ColorPicker from '../../../../../component/form/colorPicker/ColorPicker';
import MeasureInput from '../../../../../component/form/MeasureInput/measure-input';
import type { FileContent } from '../../../../../component/view/openButton.types';
import Select from '../../../../../component/form/Select';
import SettingsAccordion from './SettingsAccordion';
import SettingsPanel from './SettingsPanel';
import ManageSettingsMenu from './ManageSettingsMenu';
import {
  type SettingsFormValue,
  type StructService,
  KetcherLogger,
} from 'ketcher-core';
import SystemFonts from '../../../../../component/form/systemfonts';
import classes from './Settings.module.less';
import appClasses from '../../../../../App/App.module.less';
import { connect } from 'react-redux';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { saveSettings } from '../../../../../state/options';
import settingsSchema from '../../../../../data/schema/options-schema';
import {
  ACS_STYLE_DEFAULT_SETTINGS,
  KETCHER_ROOT_NODE_CSS_SELECTOR,
} from 'src/constants';
import { onAction } from 'src/script/ui/state/shared';
import i18n from 'src/i18n/i18n';
import { saveAs } from 'file-saver';

interface SettingsProperties extends BaseProperties {
  ketcherId: string;
  initState: SettingsFormValue;
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

interface SettingsCallProperties extends BaseCallProperties {
  onOpenFile: (content: File | FileContent) => void;
  onReset: () => void;
  onACSStyle: (result) => void;
}

type SettingsOwnProperties = Pick<SettingsProperties, 'ketcherId'> &
  Pick<BaseCallProperties, 'onOk'>;

type Properties = SettingsProperties & SettingsCallProperties;

const settingsProperties = settingsSchema.properties;

const SettingsDialog = (properties: Properties) => {
  const { t } = useTranslation(['common', 'dialogs', 'settings']);
  const { initState, formState, onOpenFile, onReset, appOpts, ...property } =
    properties;

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
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(
            settingsProperties?.showHydrogenLabels,
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
          hintAlign="right"
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
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(
            settingsProperties?.stereoLabelStyle,
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
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(
            settingsProperties?.colorStereogenicCenters,
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
          className={classes.stackedMeasureInput}
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
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(
            settingsProperties?.resetToSelect,
            t,
          )}
          data-testid="reset-to-select"
        />
        <Field
          name="rotationStep"
          hint={t('dialogs:meta.settings.rotationStepTooltip')}
          data-testid="rotation-step"
          className={classes.stackedMeasureInput}
        />
        <Field
          name="font"
          component={SystemFonts}
          className={classes.stackedField}
          data-testid="font-selection"
        />
        <Field
          name="fontsz"
          component={MeasureInput}
          labelPos={false}
          extraName="fontszUnit"
          className={classes.stackedMeasureInput}
        />
        <Field
          name="fontszsub"
          component={MeasureInput}
          labelPos={false}
          extraName="fontszsubUnit"
          className={classes.stackedMeasureInput}
        />
        <Field
          name="imageResolution"
          hint={t('dialogs:meta.settings.imageResolutionTooltip')}
          component={Select}
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(
            settingsProperties?.imageResolution,
            t,
          )}
          data-testid="image-resolution"
        />
        <Field
          name="miewMode"
          component={Select}
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(settingsProperties?.miewMode, t)}
          data-testid="display-mode"
        />
        <Field
          name="miewTheme"
          component={Select}
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(settingsProperties?.miewTheme, t)}
          data-testid="background-color"
        />
        <Field
          name="miewAtomLabel"
          component={Select}
          className={classes.stackedField}
          options={getSelectOptionsFromSchema(
            settingsProperties?.miewAtomLabel,
            t,
          )}
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
    property.onACSStyle({
      ...formState.result,
      ...ACS_STYLE_DEFAULT_SETTINGS,
    });
  };

  const handleSave = () => {
    const blob = new Blob([JSON.stringify(formState.result)], {
      type: 'application/json',
    });
    saveAs(blob, 'ketcher-settings.json');
  };

  const handleLoad = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') onOpenFile(content);
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const tabs = [
    generalTab,
    atomsTab,
    bondsTab,
    stereoTab,
    reactionsTab,
    validationTab,
    debuggingTab,
  ];

  // Apply commits the staged form result; Cancel and the close button discard it by
  // closing the dialog without touching `options.settings`.
  const handleApply = () => {
    if (!formState.valid) return;
    property.onOk?.([formState.result, initState]);
  };

  return (
    <SettingsPanel
      className={property.className}
      title={t('dialogs:meta.settings.headerTitle')}
      boundsElement={boundsElement}
      isApplyDisabled={!formState.valid}
      onApply={handleApply}
      onCancel={property.onCancel}
      onClose={property.onCancel}
      footerLeft={
        <ManageSettingsMenu
          onResetToDefault={onReset}
          onResetToACS={onACSStyle}
          onSave={handleSave}
          onLoad={handleLoad}
        />
      }
    >
      <Form schema={settingsSchema} init={initState} {...formState}>
        <SettingsAccordion groups={tabs} className={classes.accordion} />
      </Form>
    </SettingsPanel>
  );
};

const mapStateToProperties = (state) => ({
  server: state.options.app.server ? state.server : null,
  appOpts: state.options.app,
  initState: state.options.settings,
  formState: state.modal.form,
});

const mapDispatchToProperties = (
  dispatch,
  ownProperties: SettingsOwnProperties,
) => ({
  onOpenFile: (newOptions) => {
    try {
      dispatch(updateFormState({ result: JSON.parse(newOptions) }));
    } catch (error) {
      KetcherLogger.error('Settings.tsx::mapDispatchToProps', error);
      console.info('Bad file');
    }
  },
  onReset: () => dispatch(setDefaultSettings()),
  onOk: (resource) => {
    const [result, initState] = resource;

    dispatch(saveSettings(result, ownProperties.ketcherId));
    ownProperties.onOk(result);

    const shouldShowNotification =
      initState.reactionComponentMarginSize !==
      result.reactionComponentMarginSize;

    if (shouldShowNotification) {
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

const Settings = connect(
  mapStateToProperties,
  mapDispatchToProperties,
)(SettingsDialog);

export default Settings;
