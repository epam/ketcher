import { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useDelete from '../hooks/useDelete';
import { MenuItemsProps } from '../contextMenu.types';
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
} from 'ketcher-core';
import { atom } from 'src/script/ui/data/schema/struct-schema';
import styles from '../ContextMenu.module.less';

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
];

const atomPropertiesForSubMenu: {
  title: string;
  key: AtomAllAttributeName;
  buttons: {
    label: string;
    value: AtomAllAttributeValue;
    testId: string;
  }[];
}[] = [
  {
    title: ringBondCount.title,
    key: 'ringBondCount',
    buttons: ringBondCount.enumNames.map((label, id) => ({
      label,
      value: ringBondCount.enum[id],
      testId: `ringBondCount-${ringBondCount.enumNames[id]}`,
    })),
  },
  {
    title: hCount.title,
    key: 'hCount',
    buttons: hCount.enumNames.map((label, id) => ({
      label,
      value: hCount.enum[id],
      testId: `hCount-${hCount.enumNames[id]}`,
    })),
  },
  {
    title: substitutionCount.title,
    key: 'substitutionCount',
    buttons: substitutionCount.enumNames.map((label, id) => ({
      label,
      value: substitutionCount.enum[id],
      testId: `substitutionCount-${substitutionCount.enumNames[id]}`,
    })),
  },
  {
    title: unsaturatedAtom.title,
    key: 'unsaturatedAtom',
    buttons: [
      {
        label: 'Unsaturated',
        value: 1,
        testId: `unsaturatedAtom-unsaturated`,
      },
      {
        label: 'Saturated',
        value: 0,
        testId: `unsaturatedAtom-saturated`,
      },
    ],
  },
  {
    title: implicitHCount.title,
    key: 'implicitHCount',
    buttons: implicitHCount.enumNames.map((label, id) => ({
      label,
      value: implicitHCount.enum[id],
      testId: `implicitHCount-${implicitHCount.enumNames[id]}`,
    })),
  },
  ...properties.map((name) => ({
    title: atom.properties[name].title,
    key: name,
    buttons: atom.properties[name].enumNames.map(
      (label: string, id: number) => ({
        label,
        value: atom.properties[name].enum[id],
        testId: `${atom.properties[name]}-${atom.properties[name].enumNames[id]}`,
      }),
    ),
  })),
];

const AtomMenuItems: FC<MenuItemsProps> = (props) => {
  const [handleEdit] = useAtomEdit();
  const [handleStereo, stereoDisabled] = useAtomStereo();
  const handleDelete = useDelete();
  const { getKetcherInstance } = useAppContext();
  const editor = getKetcherInstance().editor as Editor;

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
        data-testid="query-properties"
        style={{ overflow: 'visible' }}
      >
        {atomPropertiesForSubMenu.map(({ title, buttons, key }) => {
          return (
            <Submenu
              {...props}
              label={title}
              data-testid={`context-menu-${title}`}
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
      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default AtomMenuItems;
