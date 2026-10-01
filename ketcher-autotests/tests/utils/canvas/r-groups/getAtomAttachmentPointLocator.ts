import { Page, Locator } from '@playwright/test';

export enum AttachmentPointType {
  Primary = 'primary',
  Secondary = 'secondary',
}

type AtomAttachmentPointLocatorOptions = {
  primaryOrSecondary?: AttachmentPointType;
  attachedToAtomId?: number;
};

export function getAtomAttachmentPointLocator(
  page: Page,
  options: AtomAttachmentPointLocatorOptions,
): Locator {
  const attributes: Record<string, string> = {};

  attributes['data-testid'] = 'attachment-point';

  if (options.primaryOrSecondary) {
    attributes['data-primary-or-secondary'] = String(
      options.primaryOrSecondary,
    );
  }

  if (options.attachedToAtomId) {
    attributes['data-attached-to-atom-id'] = String(options.attachedToAtomId);
  }

  const attributeSelectors = Object.entries(attributes)
    .map(([key, value]) => `[${key}="${value}"]`)
    .join('');

  return page.locator(attributeSelectors);
}
