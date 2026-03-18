import { FC } from 'react';
import { Item } from 'react-contexify';
import {
  MenuItemsProps,
  RGroupAttachmentPointContextMenuProps,
} from '../contextMenu.types';
import useRGroupAttachmentPointRemove from '../hooks/useRGroupAttachmentPointRemove';
import useRGroupAttachmentPointEdit from '../hooks/useRGroupAttachmentPointEdit';
import { useAppContext } from 'src/hooks/useAppContext';
import Editor from 'src/script/editor';

import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { ketcherProvider } from 'ketcher-core';

const RGroupAttachmentPointMenuItems: FC<
  MenuItemsProps<RGroupAttachmentPointContextMenuProps>
> = (props) => {
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
      props.propsFromTrigger?.rgroupAttachmentPoints || [];
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
        {...props}
        disabled={rgroupAttachmentPointDisabled}
        hidden={rgroupAttachmentPointHidden}
        onClick={handleEditRGroupAttachmentPoint}
      >
        Edit...
      </Item>
      <HighlightMenu onHighlight={highlight} />
      <Item {...props} onClick={handleRemove}>
        Remove
      </Item>
    </>
  );
};

export default RGroupAttachmentPointMenuItems;
