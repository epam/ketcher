import { Page, Locator } from '@playwright/test';
import { ExtendedTableButton } from '@tests/pages/constants/extendedTableWindow/Constants';

type ExtendedTableDialogLocators = {
  closeWindowButton: Locator;
  addButton: Locator;
  cancelButton: Locator;
  AButton: Locator;
  AHButton: Locator;
  QButton: Locator;
  QHButton: Locator;
  MButton: Locator;
  MHButton: Locator;
  XButton: Locator;
  XHButton: Locator;
  H_PLUSButton: Locator;
  DButton: Locator;
  TButton: Locator;
  RButton: Locator;
  PolButton: Locator;
  GButton: Locator;
  GHButton: Locator;
  G_STARButton: Locator;
  GH_STARButton: Locator;
  ACYButton: Locator;
  ACHButton: Locator;
  ABCButton: Locator;
  ABHButton: Locator;
  AYLButton: Locator;
  AYHButton: Locator;
  ALKButton: Locator;
  ALHButton: Locator;
  AELButton: Locator;
  AEHButton: Locator;
  AHCButton: Locator;
  AHHButton: Locator;
  AOXButton: Locator;
  AOHButton: Locator;
  CYCButton: Locator;
  CYHButton: Locator;
  CXXButton: Locator;
  CXHButton: Locator;
  CBCButton: Locator;
  CBHButton: Locator;
  ARYButton: Locator;
  ARHButton: Locator;
  CALButton: Locator;
  CAHButton: Locator;
  CELButton: Locator;
  CEHButton: Locator;
  CHCButton: Locator;
  CHHButton: Locator;
  HARButton: Locator;
  HAHButton: Locator;
};

export const ExtendedTableDialog = (page: Page) => {
  const getButton = (dataTestId: string): Locator =>
    page.getByTestId(dataTestId);

  const locators: ExtendedTableDialogLocators = {
    closeWindowButton: page.getByTestId('close-window-button'),
    addButton: page.getByTestId('OK'),
    cancelButton: page.getByTestId('Cancel'),
    AButton: page.getByTestId(ExtendedTableButton.A),
    AHButton: page.getByTestId(ExtendedTableButton.AH),
    QButton: page.getByTestId(ExtendedTableButton.Q),
    QHButton: page.getByTestId(ExtendedTableButton.QH),
    MButton: page.getByTestId(ExtendedTableButton.M),
    MHButton: page.getByTestId(ExtendedTableButton.MH),
    XButton: page.getByTestId(ExtendedTableButton.X),
    XHButton: page.getByTestId(ExtendedTableButton.XH),
    H_PLUSButton: page.getByTestId(ExtendedTableButton.H_PLUS),
    DButton: page.getByTestId(ExtendedTableButton.D),
    TButton: page.getByTestId(ExtendedTableButton.T),
    RButton: page.getByTestId(ExtendedTableButton.R),
    PolButton: page.getByTestId(ExtendedTableButton.Pol),
    GButton: page.getByTestId(ExtendedTableButton.G),
    GHButton: page.getByTestId(ExtendedTableButton.GH),
    G_STARButton: page.getByTestId(ExtendedTableButton.G_STAR),
    GH_STARButton: page.getByTestId(ExtendedTableButton.GH_STAR),
    ACYButton: page.getByTestId(ExtendedTableButton.ACY),
    ACHButton: page.getByTestId(ExtendedTableButton.ACH),
    ABCButton: page.getByTestId(ExtendedTableButton.ABC),
    ABHButton: page.getByTestId(ExtendedTableButton.ABH),
    AYLButton: page.getByTestId(ExtendedTableButton.AYL),
    AYHButton: page.getByTestId(ExtendedTableButton.AYH),
    ALKButton: page.getByTestId(ExtendedTableButton.ALK),
    ALHButton: page.getByTestId(ExtendedTableButton.ALH),
    AELButton: page.getByTestId(ExtendedTableButton.AEL),
    AEHButton: page.getByTestId(ExtendedTableButton.AEH),
    AHCButton: page.getByTestId(ExtendedTableButton.AHC),
    AHHButton: page.getByTestId(ExtendedTableButton.AHH),
    AOXButton: page.getByTestId(ExtendedTableButton.AOX),
    AOHButton: page.getByTestId(ExtendedTableButton.AOH),
    CYCButton: page.getByTestId(ExtendedTableButton.CYC),
    CYHButton: page.getByTestId(ExtendedTableButton.CYH),
    CXXButton: page.getByTestId(ExtendedTableButton.CXX),
    CXHButton: page.getByTestId(ExtendedTableButton.CXH),
    CBCButton: page.getByTestId(ExtendedTableButton.CBC),
    CBHButton: page.getByTestId(ExtendedTableButton.CBH),
    ARYButton: page.getByTestId(ExtendedTableButton.ARY),
    ARHButton: page.getByTestId(ExtendedTableButton.ARH),
    CALButton: page.getByTestId(ExtendedTableButton.CAL),
    CAHButton: page.getByTestId(ExtendedTableButton.CAH),
    CELButton: page.getByTestId(ExtendedTableButton.CEL),
    CEHButton: page.getByTestId(ExtendedTableButton.CEH),
    CHCButton: page.getByTestId(ExtendedTableButton.CHC),
    CHHButton: page.getByTestId(ExtendedTableButton.CHH),
    HARButton: page.getByTestId(ExtendedTableButton.HAR),
    HAHButton: page.getByTestId(ExtendedTableButton.HAH),
  };

  return {
    ...locators,

    async closeByX() {
      await locators.closeWindowButton.click();
    },

    async pressAddButton() {
      await locators.addButton.click();
    },

    async pressCancelButton() {
      await locators.cancelButton.click();
    },

    async clickExtendedTableElement(ExtendedTableButton: ExtendedTableButton) {
      await getButton(ExtendedTableButton).click();
    },
  };
};

export async function selectExtendedTableElement(
  page: Page,
  name: ExtendedTableButton,
) {
  await ExtendedTableDialog(page).clickExtendedTableElement(name);
}

export type ExtendedTableDialogType = ReturnType<typeof ExtendedTableDialog>;
