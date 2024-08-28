import { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useDelete from '../hooks/useDelete';
import { AtomContextMenuProps, MenuItemsProps } from '../contextMenu.types';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import ButtonGroup from '../../../../../../components/ToggleButtonGroup/ToggleButtonGroup';
import {
  atomGetAttr,
  AtomAttributeName,
  AtomAllAttributeValue,
  AtomQueryPropertiesName,
  AtomQueryProperties,
  AtomAllAttributeName,
  Atom,
} from 'ketcher-core';
import { atom } from 'src/script/ui/data/schema/struct-schema';
import styles from '../ContextMenu.module.less';
import useAddAttachmentPoint from '../hooks/useAddAttachmentPoint';
import { isNumber } from 'lodash';
import useRemoveAttachmentPoint from '../hooks/useRemoveAttachmentPoint';

const {
  ringBondCount,
  hCount,
  substitutionCount,
  unsaturatedAtom,
  implicitHCount,
} = atom.properties;
const properties: Array<AtomQueryPropertiesName> = [
  'aromaticity',
  'ringMembership',
  'ringSize',
  'connectivity',
  'chirality',
];

const atomPropertiesForSubMenu: {
  title: string;
  key: AtomAllAttributeName;
  buttons: { label: string; value: AtomAllAttributeValue }[];
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
  {
    title: implicitHCount.title,
    key: 'implicitHCount',
    buttons: implicitHCount.enumNames.map((label, id) => ({
      label,
      value: implicitHCount.enum[id],
    })),
  },
  ...properties.map((name) => ({
    title: atom.properties[name].title,
    key: name,
    buttons: atom.properties[name].enumNames.map(
      (label: string, id: number) => ({
        label,
        value: atom.properties[name].enum[id],
      }),
    ),
  })),
];

const AtomMenuItems: FC<MenuItemsProps<AtomContextMenuProps>> = (props) => {
  const [handleEdit] = useAtomEdit();
  const [handleAddAttachmentPoint] = useAddAttachmentPoint();
  const [handleRemoveAttachmentPoint] = useRemoveAttachmentPoint();
  const [handleStereo, stereoDisabled] = useAtomStereo();
  const handleDelete = useDelete();
  const { getKetcherInstance } = useAppContext();
  const editor = getKetcherInstance().editor as Editor;
  const struct = editor.struct();

  const getPropertyValue = (key: AtomAllAttributeName) => {
    const { ctab } = editor.render;
    if (props.propsFromTrigger?.atomIds) {
      const atomId = props.propsFromTrigger?.atomIds[0] as number;
      if (properties.includes(key as AtomQueryPropertiesName)) {
        return atomGetAttr(ctab, atomId, 'queryProperties')?.[key];
      } else {
        return atomGetAttr(ctab, atomId, key as AtomAttributeName);
      }
    } else return null;
  };

  const updateAtomProperty = (
    key: AtomAllAttributeName,
    value: AtomAllAttributeValue,
  ) => {
    const atomIds = props.propsFromTrigger?.atomIds;
    if (atomIds) {
      updateSelectedAtoms({
        atoms: atomIds,
        editor,
        changeAtomPromise: Promise.resolve(
          properties.includes(key as AtomQueryPropertiesName)
            ? ({
                queryProperties: {
                  ...getPropertyValue('queryProperties'),
                  [key]: value,
                },
              } as AtomQueryProperties)
            : { [key]: value },
        ),
      });
    }
  };

  const onlyOneAtomSelected = props.propsFromTrigger?.atomIds?.length === 1;
  const selectedAtomId = props.propsFromTrigger?.atomIds?.[0];
  const sgroup = isNumber(selectedAtomId)
    ? struct.getGroupFromAtomId(selectedAtomId)
    : undefined;
  const atomInSgroupWithLabel = sgroup && !sgroup?.isSuperatomWithoutLabel;
  const attachmentPoints = sgroup?.getAttachmentPoints() || [];
  const maxAttachmentPointsAmount = attachmentPoints.length >= 8;
  const isAtomSuperatomAttachmentPoint = Atom.isSuperatomAttachmentAtom(
    struct,
    selectedAtomId,
  );
  const isAtomSuperatomLeavingGroup = Atom.isSuperatomLeavingGroupAtom(
    struct,
    selectedAtomId,
  );
  const atomExternalConnections = isNumber(selectedAtomId)
    ? Atom.getAttachmentAtomExternalConnections(struct, selectedAtomId)
    : undefined;
  const atomFreeAttachmentPoints = attachmentPoints?.filter(
    (attachmentPoint) =>
      attachmentPoint.atomId === selectedAtomId &&
      !atomExternalConnections?.some(
        (bond) =>
          bond.endSuperatomAttachmentPointNumber ===
            attachmentPoint.attachmentPointNumber ||
          bond.beginSuperatomAttachmentPointNumber ===
            attachmentPoint.attachmentPointNumber,
      ),
  );

  if (isAtomSuperatomLeavingGroup && onlyOneAtomSelected) {
    return (
      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    );
  }

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
      <Submenu
        {...props}
        label="Query properties"
        style={{ overflow: 'visible' }}
      >
        {atomPropertiesForSubMenu.map(({ title, buttons, key }) => {
          return (
            <Submenu
              {...props}
              label={title}
              key={key}
              className={styles.sameGroup}
            >
              <ButtonGroup<AtomAllAttributeValue>
                buttons={buttons}
                defaultValue={getPropertyValue(key)}
                onClick={(value: AtomAllAttributeValue) =>
                  updateAtomProperty(key, value)
                }
              ></ButtonGroup>
            </Submenu>
          );
        })}
      </Submenu>
      {onlyOneAtomSelected &&
        !atomInSgroupWithLabel &&
        !maxAttachmentPointsAmount &&
        !isAtomSuperatomLeavingGroup && (
          <Item {...props} onClick={handleAddAttachmentPoint}>
            Add attachment point
          </Item>
        )}
      {isAtomSuperatomAttachmentPoint &&
        atomFreeAttachmentPoints.length > 0 && (
          <Item {...props} onClick={handleRemoveAttachmentPoint}>
            Remove attachment point
          </Item>
        )}
      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default AtomMenuItems;
