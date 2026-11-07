import type { FC } from 'react';
import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import type {
  MenuItemsProperties,
  RGroupAttachmentPointContextMenuProperties,
} from '../contextMenu.types';
import useRGroupAttachmentPointRemove from '../hooks/useRGroupAttachmentPointRemove';
import useRGroupAttachmentPointEdit from '../hooks/useRGroupAttachmentPointEdit';
import { useAppContext } from 'src/hooks/useAppContext';
import type Editor from 'src/script/editor';

import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { ketcherProvider } from 'ketcher-core';

const RGroupAttachmentPointMenuItems: FC<
  MenuItemsProperties<RGroupAttachmentPointContextMenuProperties>
> = (properties) => {
  const { t } = useTranslation('components');
  const { ketcherId } = useAppContext();
  const handleRemove = useRGroupAttachmentPointRemove();
  const [
    handleEditRGroupAttachmentPoint,
    rgroupAttachmentPointDisabled,
    rgroupAttachmentPointHidden,
  ] = useRGroupAttachmentPointEdit();
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

  const highlight = (color: string) => {
    const rgroupAttachmentPoints =
      properties.propsFromTrigger?.rgroupAttachmentPoints || [];
    editor.highlights.create({
      rgroupAttachmentPoints,
      atoms: [],
      bonds: [],
      color: color === '' ? 'transparent' : color,
    });
  };

  return (
    <>
      <Item
        {...properties}
        disabled={rgroupAttachmentPointDisabled}
        hidden={rgroupAttachmentPointHidden}
        onClick={handleEditRGroupAttachmentPoint}
      >
        {t('contextMenu.editEllipsis')}
      </Item>
      <HighlightMenu onHighlight={highlight} />
      <Item {...properties} onClick={handleRemove}>
        {t('contextMenu.remove')}
      </Item>
    </>
  );
};

export default RGroupAttachmentPointMenuItems;
