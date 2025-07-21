/* eslint-disable no-magic-numbers */
import { Page, Locator } from '@playwright/test';
import {
  ComponentOption,
  ContextOption,
  PropertyLabelType,
  RepeatPatternOption,
  SGroupPropertiesSettings,
  TypeOption,
} from '@tests/pages/constants/s-GroupPropertiesDialog/Constants';
import { delay } from '@utils/canvas';
import { waitForRender } from '@utils/common';

type SGroupPropertiesLocators = {
  sGroupDialog: Locator;
  closeWindowButton: Locator;
  typeDropdown: Locator;
  contextDropdown: Locator;
  fieldNameEditbox: Locator;
  fieldValueEditbox: Locator;
  absoluteRadioButton: Locator;
  relativeRadioButton: Locator;
  attachedRadioButton: Locator;
  repeatCountEditbox: Locator;
  polymerLabelEditbox: Locator;
  repeatPatternDropdown: Locator;
  nameEditbox: Locator;
  componentDropdown: Locator;
  applyButton: Locator;
  cancelButton: Locator;
};

export const SGroupPropertiesDialog = (page: Page) => {
  const locators: SGroupPropertiesLocators = {
    sGroupDialog: page.getByTestId('sgroup-dialog'),
    closeWindowButton: page.getByTestId('close-window-button'),
    typeDropdown: page.getByTestId('s-group-type-input-span'),
    contextDropdown: page.getByTestId('context-input-span'),
    fieldNameEditbox: page.getByTestId('fieldName-input'),
    fieldValueEditbox: page.getByTestId('fieldValue-input'),
    absoluteRadioButton: page.getByTestId('radiobuttons-input-Absolute'),
    relativeRadioButton: page.getByTestId('radiobuttons-input-Relative'),
    attachedRadioButton: page.getByTestId('radiobuttons-input-Attached'),
    repeatCountEditbox: page.getByTestId('mul-input'),
    polymerLabelEditbox: page.getByTestId('subscript-input'),
    repeatPatternDropdown: page.getByTestId('connectivity-input-span'),
    nameEditbox: page.getByTestId('name-input'),
    componentDropdown: page.getByTestId('class-input-span'),
    applyButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
  };

  return {
    ...locators,

    async close() {
      await locators.closeWindowButton.click();
    },

    async cancel() {
      await locators.cancelButton.click();
    },

    async apply() {
      await waitForRender(page, async () => {
        await locators.applyButton.click();
      });
    },

    async selectType(type: TypeOption) {
      const typeToSelect = page.getByTestId(type);

      await locators.typeDropdown.waitFor({ state: 'visible' });
      await locators.typeDropdown.click();
      await typeToSelect.waitFor({ state: 'visible' });
      await delay(0.1);
      await typeToSelect.click({ force: true, timeout: 100 });
      await typeToSelect.waitFor({ state: 'hidden' });
    },

    async selectContext(context: ContextOption) {
      const contextToSelect = page.getByTestId(context);

      await locators.contextDropdown.waitFor({ state: 'visible' });
      await locators.contextDropdown.click();
      await contextToSelect.waitFor({ state: 'visible' });
      await contextToSelect.click({ force: true });
      await contextToSelect.waitFor({ state: 'hidden' });
    },

    async setFieldNameValue(value: string) {
      await locators.fieldNameEditbox.waitFor({ state: 'visible' });
      await locators.fieldNameEditbox.fill(value);
    },

    async setFieldValueValue(value: string) {
      await locators.fieldValueEditbox.waitFor({ state: 'visible' });
      await locators.fieldValueEditbox.fill(value);
    },

    async selectPropertyLabelType(propertyLabelType: PropertyLabelType) {
      const propertyLabelTypeRadioButton = page.getByTestId(propertyLabelType);
      await propertyLabelTypeRadioButton.waitFor({ state: 'visible' });
      await propertyLabelTypeRadioButton.click();
    },

    async setRepeatCountValue(value: string) {
      await locators.repeatCountEditbox.waitFor({ state: 'visible' });
      await locators.repeatCountEditbox.fill(value);
    },

    async setPolymerLabelValue(value: string) {
      await locators.polymerLabelEditbox.waitFor({ state: 'visible' });
      await locators.polymerLabelEditbox.fill(value);
    },

    async selectRepeatPattern(repeatPattern: RepeatPatternOption) {
      const contextToSelect = page.getByTestId(repeatPattern);

      await locators.repeatPatternDropdown.waitFor({ state: 'visible' });
      await locators.repeatPatternDropdown.click();
      await contextToSelect.waitFor({ state: 'visible' });
      await contextToSelect.click({ force: true });
      await contextToSelect.waitFor({ state: 'hidden' });
    },

    async setNameValue(value: string) {
      await locators.nameEditbox.waitFor({ state: 'visible' });
      await locators.nameEditbox.fill(value);
    },

    async selectComponent(component: ComponentOption) {
      const contextToSelect = page.getByTestId(component);

      await locators.componentDropdown.waitFor({ state: 'visible' });
      await locators.componentDropdown.click();
      await contextToSelect.waitFor({ state: 'visible' });
      await contextToSelect.click({ force: true });
      await contextToSelect.waitFor({ state: 'hidden' });
    },

    async setOptions(options: SGroupPropertiesSettings) {
      await this.selectType(options.Type);
      if (options.Type === TypeOption.Data) {
        await this.selectContext(options.Context);
        await this.setFieldNameValue(options.FieldName);
        await this.setFieldValueValue(options.FieldValue);
        await this.selectPropertyLabelType(options.PropertyLabelType);
      } else if (options.Type === TypeOption.MultipleGroup) {
        await this.setRepeatCountValue(options.RepeatCount);
      } else if (options.Type === TypeOption.SRUPolymer) {
        await this.setPolymerLabelValue(options.PolymerLabel);
        await this.selectRepeatPattern(options.RepeatPattern);
      } else if (options.Type === TypeOption.Superatom) {
        await this.setNameValue(options.Name);
      } else if (options.Type === TypeOption.NucleotideComponent) {
        await this.selectType(options.Type);
        await this.selectComponent(options.Component);
      }
      await this.apply();
    },
  };
};

export type SGroupPropertiesDialogType = ReturnType<
  typeof SGroupPropertiesDialog
>;
