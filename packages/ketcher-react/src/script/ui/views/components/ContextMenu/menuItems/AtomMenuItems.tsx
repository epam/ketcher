import { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useDelete from '../hooks/useDelete';
import { MenuItemsProps } from '../contextMenu.types';
import useRGroupAttachmentPointEdit from '../hooks/useRGroupAttachmentPointEdit';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import ButtonGroup from '../../../../../../components/ToggleButtonGroup/ToggleButtonGroup';
import { atomGetAttr, AtomAttributeName } from 'ketcher-core';
import { atom } from 'src/script/ui/data/schema/struct-schema';

const { ringBondCount, hCount, substitutionCount, unsaturatedAtom } =
  atom.properties;
const atomPropertiesForSubMenu: {
  title: string;
  key: AtomAttributeName;
  buttons: { label: string; value: number }[];
}[] = [
  {
    title: ringBondCount.title,
    key: 'ringBondCount',
    buttons: ringBondCount.enumNames.map((label, id) => ({
      label,
      value: ringBondCount.enum[id],
    })),
  },
  {
    title: hCount.title,
    key: 'hCount',
    buttons: hCount.enumNames.map((label, id) => ({
      label,
      value: hCount.enum[id],
    })),
  },
  {
    title: substitutionCount.title,
    key: 'substitutionCount',
    buttons: substitutionCount.enumNames.map((label, id) => ({
      label,
      value: substitutionCount.enum[id],
    })),
  },
  {
    title: unsaturatedAtom.title,
    key: 'unsaturatedAtom',
    buttons: [
      { label: 'Unsaturated', value: 1 },
      { label: 'Saturated', value: 0 },
    ],
  },
];

const AtomMenuItems: FC<MenuItemsProps> = (props) => {
  const [handleEdit] = useAtomEdit();
  const [handleStereo, stereoDisabled] = useAtomStereo();
  const [
    handleEditRGroupAttachmentPoint,
    rgroupAttachmentPointDisabled,
    rgroupAttachmentPointHidden,
  ] = useRGroupAttachmentPointEdit();
  const handleDelete = useDelete();
  const { getKetcherInstance } = useAppContext();
  const editor = getKetcherInstance().editor as Editor;

  const updateAtomProperty = (key: AtomAttributeName, value: number) => {
    updateSelectedAtoms({
      atoms: props.propsFromTrigger?.atomIds as number[],
      editor,
      changeAtomPromise: Promise.resolve({ [key]: value }),
    });
  };

  const getPropertyValue = (key: AtomAttributeName) => {
    if (props.propsFromTrigger?.atomIds) {
      const atomId = props.propsFromTrigger?.atomIds[0] as number;
      return Number(atomGetAttr(editor.render.ctab, atomId, key));
    } else return 0;
  };

  return (
    <>
      <Item {...props} onClick={handleEdit}>
        {props.propsFromTrigger?.extraItemsSelected
          ? 'Edit selected atoms...'
          : 'Edit...'}
      </Item>

      <Item {...props} disabled={stereoDisabled} onClick={handleStereo}>
        Enhanced stereochemistry...
      </Item>

      <Item
        {...props}
        disabled={rgroupAttachmentPointDisabled}
        hidden={rgroupAttachmentPointHidden}
        onClick={handleEditRGroupAttachmentPoint}
      >
        Edit R-Group attachment point...
      </Item>
      <Submenu
        {...props}
        label="Query properties"
        style={{ overflow: 'visible' }}
      >
        {atomPropertiesForSubMenu.map(({ title, buttons, key }) => {
          return (
            <Submenu {...props} label={title} key={key}>
              <ButtonGroup<number>
                buttons={buttons}
                defaultValue={getPropertyValue(key)}
                onClick={(value: number) => updateAtomProperty(key, value)}
              ></ButtonGroup>
            </Submenu>
          );
        })}
      </Submenu>
      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default AtomMenuItems;
