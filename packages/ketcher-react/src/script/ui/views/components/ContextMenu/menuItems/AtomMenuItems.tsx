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
import ButtonGroup from './ToggleButtonGroup/ToggleButtonGroup';
import { atomGetAttr, AtomAttributeName } from 'ketcher-core';
import { atom } from 'src/script/ui/data/schema/struct-schema';

const atomPropertiesForSubMenu: {
  title: string;
  key: AtomAttributeName;
  enum: number[];
  enumNames: string[];
}[] = [
  { ...atom.properties.ringBondCount, key: 'ringBondCount' },
  { ...atom.properties.hCount, key: 'hCount' },
  { ...atom.properties.substitutionCount, key: 'substitutionCount' },
  {
    ...atom.properties.unsaturatedAtom,
    enum: [0, 1],
    enumNames: ['Unsaturated', 'Saturated'],
    key: 'unsaturatedAtom',
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
        {atomPropertiesForSubMenu.map(
          ({ title, enum: values, enumNames, key }) => {
            return (
              <Submenu {...props} label={title} key={key}>
                <ButtonGroup
                  buttons={{ labels: enumNames, values }}
                  actualValue={getPropertyValue(key)}
                  propertyKey={key}
                  onClick={updateAtomProperty}
                ></ButtonGroup>
              </Submenu>
            );
          },
        )}
      </Submenu>
      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default AtomMenuItems;
