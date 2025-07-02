import { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import tools from '../../../../action/tools';
import styles from '../ContextMenu.module.less';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useBondEdit from '../hooks/useBondEdit';
import useBondTypeChange from '../hooks/useBondTypeChange';
import useDelete from '../hooks/useDelete';
import { formatTitle, getBondNames } from '../utils';
import Editor from 'src/script/editor';
import {
  MenuItemsProps,
  SelectionContextMenuProps,
} from '../contextMenu.types';
import { getIconName, Icon } from 'components';
import { useAppContext } from 'src/hooks';
import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { ketcherProvider } from 'ketcher-core';

const bondNames = getBondNames(tools);

const SelectionMenuItems: FC<MenuItemsProps<SelectionContextMenuProps>> = (
  props,
) => {
  const { ketcherId } = useAppContext();
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
  const [handleBondEdit, bondEditDisabled] = useBondEdit();
  const [handleAtomEdit, atomEditDisabled] = useAtomEdit();
  const [handleTypeChange, bondTypeChangeDisabled] = useBondTypeChange();
  const [handleAtomStereo, atomStereoDisabled] = useAtomStereo();
  const handleDelete = useDelete();
  const highlightBondWithColor = (color: string) => {
    const bondIds = props.propsFromTrigger?.bondIds || [];
    const atomIds = props.propsFromTrigger?.atomIds || [];
    const rgroupAttachmentPoints =
      props.propsFromTrigger?.rgroupAttachmentPoints || [];

    editor.highlights.create({
      atoms: atomIds,
      bonds: bondIds,
      rgroupAttachmentPoints,
      color: color === '' ? 'transparent' : color,
    });
  };

  return (
    <>
      <Item
        {...props}
        data-testid="Edit selected bonds...-option"
        disabled={bondEditDisabled}
        onClick={handleBondEdit}
      >
        Edit selected bonds...
      </Item>

      <Item
        {...props}
        data-testid="Edit selected atoms...-option"
        disabled={atomEditDisabled}
        onClick={handleAtomEdit}
      >
        Edit selected atoms...
      </Item>

      <Submenu
        {...props}
        data-testid="Bond type-option"
        label="Bond type"
        disabled={bondTypeChangeDisabled}
        className={styles.subMenu}
      >
        {bondNames.map((name) => {
          const iconName = getIconName(name);
          return (
            <Item id={name} onClick={handleTypeChange} key={name}>
              {iconName && <Icon name={iconName} className={styles.icon} />}
              <span>{formatTitle(tools[name].title)}</span>
            </Item>
          );
        })}
      </Submenu>

      <Item
        {...props}
        data-testid="Enhanced stereochemistry...-option"
        disabled={atomStereoDisabled}
        onClick={handleAtomStereo}
      >
        Enhanced stereochemistry...
      </Item>
      <HighlightMenu onHighlight={highlightBondWithColor} />
      <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default SelectionMenuItems;
