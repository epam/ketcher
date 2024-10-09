import { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import tools from 'src/script/ui/action/tools';
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

const bondNames = getBondNames(tools);

const SelectionMenuItems: FC<MenuItemsProps<SelectionContextMenuProps>> = (
  props,
) => {
  const { getKetcherInstance } = useAppContext();
  const editor = getKetcherInstance().editor as Editor;
  const [handleBondEdit, bondEditDisabled] = useBondEdit();
  const [handleAtomEdit, atomEditDisabled] = useAtomEdit();
  const [handleTypeChange, bondTypeChangeDisabled] = useBondTypeChange();
  const [handleAtomStereo, atomStereoDisabled] = useAtomStereo();
  const handleDelete = useDelete();
  const highlightBondWithColor = (color: string) => {
    const bondIds = props.propsFromTrigger?.bondIds || [];

    editor.highlights.create({
      atoms: [],
      bonds: bondIds,
      color: color === '' ? 'transparent' : color,
    });
  };

  return (
    <>
      <Item {...props} disabled={bondEditDisabled} onClick={handleBondEdit}>
        Edit selected bonds...
      </Item>

      <Item {...props} disabled={atomEditDisabled} onClick={handleAtomEdit}>
        Edit selected atoms...
      </Item>

      <Submenu
        {...props}
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

      <Item {...props} disabled={atomStereoDisabled} onClick={handleAtomStereo}>
        Enhanced stereochemistry...
      </Item>
      <HighlightMenu onHighlight={highlightBondWithColor} />
      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default SelectionMenuItems;
