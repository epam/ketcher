import { Page } from '@playwright/test';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  ClickTarget,
  MonomerOnMicroOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { waitForRender } from '@utils/common';

export async function expandMonomer(page: Page, monomer: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(MonomerOnMicroOption.ExpandMonomer);
  });
}

export async function collapseMonomer(page: Page, monomer: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(
      MonomerOnMicroOption.CollapseMonomer,
    );
  });
}

export async function expandMonomers(page: Page, monomer: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(MonomerOnMicroOption.ExpandMonomers);
  });
}

export async function collapseMonomers(page: Page, monomer: ClickTarget) {
  await waitForRender(page, async () => {
    await ContextMenu(page, monomer).click(
      MonomerOnMicroOption.CollapseMonomers,
    );
  });
}
