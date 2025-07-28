import { Page } from '@playwright/test';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  ClickTarget,
  MonomerOnMicroOption,
  SuperatomOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { waitForRender } from '@utils/common';

export async function expandAbbreviation(page: Page, sGroup: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, sGroup).click(SuperatomOption.ExpandAbbreviation);
  });
}

export async function contractAbbreviation(page: Page, sGroup: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, sGroup).click(SuperatomOption.ContractAbbreviation);
  });
}

export async function removeAbbreviation(page: Page, sGroup: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, sGroup).click(SuperatomOption.RemoveAbbreviation);
  });
}

export async function expandMonomer(page: Page, monomer: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(MonomerOnMicroOption.ExpandMonomer);
  });
}

export async function contractMonomer(page: Page, monomer: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(
      MonomerOnMicroOption.CollapseMonomer,
    );
  });
}
