import { Page, Locator } from '@playwright/test';
import { SelectionToolType } from '../constants/areaSelectionTool/Constants';

type SelectionTypePanelLocators = {
  currentToolButton: Locator;
  expandButton: Locator;
  dropdown: Locator;
  toolButtons: Locator;
};

/**
 * Selection tools group on the left toolbar (Micro and Macro modes):
 * the button of the currently selected tool and the dropdown with all
 * selection tools (Rectangle, Lasso, Structure, Fragment).
 */
export const SelectionTypePanel = (page: Page) => {
  const toolbarGroup = page
    .getByTestId('select-drop-down-button')
    .filter({ visible: true });
  const dropdown = page
    .getByTestId('multi-tool-dropdown')
    .filter({ visible: true })
    .filter({ has: page.getByTestId(SelectionToolType.Rectangle) });

  const locators: SelectionTypePanelLocators = {
    currentToolButton: toolbarGroup.getByRole('button'),
    expandButton: toolbarGroup.getByTestId('dropdown-expand'),
    dropdown,
    toolButtons: dropdown.getByRole('button'),
  };

  return {
    ...locators,

    toolButton(toolType: SelectionToolType): Locator {
      return locators.dropdown.getByTestId(toolType);
    },

    async expand() {
      if (await locators.dropdown.isVisible()) {
        return;
      }
      await locators.expandButton.click();
      await locators.dropdown.waitFor({ state: 'visible' });
    },

    /**
     * Closes the dropdown without changing the selected tool: clicks the tool
     * that is already selected. Escape is not reliable, since it does not reach
     * the dropdown while a text field (e.g. the clipboard textarea) has focus.
     */
    async collapse() {
      if (!(await locators.dropdown.isVisible())) {
        return;
      }
      const currentToolType =
        await locators.currentToolButton.getAttribute('data-testid');
      await locators.dropdown.getByTestId(currentToolType as string).click();
      await locators.dropdown.waitFor({ state: 'hidden' });
    },

    /**
     * Returns the selection tools listed in the dropdown, in display order.
     * The dropdown must be expanded.
     */
    async getToolTypes(): Promise<SelectionToolType[]> {
      await locators.dropdown.waitFor({ state: 'visible' });
      return locators.toolButtons.evaluateAll((buttons) =>
        buttons.map(
          (button) => (button as HTMLElement).dataset.testid as string,
        ),
      ) as Promise<SelectionToolType[]>;
    },
  };
};

export type SelectionTypePanelType = ReturnType<typeof SelectionTypePanel>;
