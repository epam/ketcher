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
  ketcherProvider,
} from 'ketcher-core';
import { atom } from '../../../../data/schema/struct-schema';
import styles from '../ContextMenu.module.less';
import useAddAttachmentPoint from '../hooks/useAddAttachmentPoint';
import { isNumber } from 'lodash';
import useRemoveAttachmentPoint from '../hooks/useRemoveAttachmentPoint';
import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { Icon } from 'components';

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
  const { ketcherId } = useAppContext();
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const editor = ketcher.editor as Editor;
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
  const highlightAtomWithColor = (color: string) => {
    const atomIds = props.propsFromTrigger?.atomIds || [];
    editor.highlights.create({
      atoms: atomIds,
      rgroupAttachmentPoints: [],
      bonds: [],
      color: color === '' ? 'transparent' : color,
    });
  };

  const isAddAttachmentPointDisabled =
    !onlyOneAtomSelected ||
    (() => {
      if (!isNumber(selectedAtomId)) return true;

      const connectedComponents = struct.findConnectedComponent(selectedAtomId);
      for (const connectedAtomId of connectedComponents) {
        const connectedGroup = struct.getGroupFromAtomId(connectedAtomId);
        if (connectedGroup?.isMonomer) {
          return true;
        }
      }

      return false;
    })();

  if (isAtomSuperatomLeavingGroup && onlyOneAtomSelected) {
    return (
      <>
        <HighlightMenu onHighlight={highlightAtomWithColor} />
        <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
          <Icon name="deleteMenu" className={styles.icon} />
          <span className={styles.contextMenuText}>Delete</span>
        </Item>
      </>
    );
  }

  return (
    <>
      <Item
        {...props}
        data-testid={
          props.propsFromTrigger?.extraItemsSelected
            ? 'Edit selected atoms...-option'
            : 'Edit...-option'
        }
        onClick={handleEdit}
      >
        <Icon name="editMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>
          {props.propsFromTrigger?.extraItemsSelected
            ? 'Edit selected atoms...'
            : 'Edit...'}
        </span>
      </Item>
      <Item
        {...props}
        data-testid="Enhanced stereochemistry...-option"
        disabled={stereoDisabled}
        onClick={handleStereo}
      >
        Enhanced stereochemistry...
      </Item>
      <Submenu
        {...props}
        label="Query properties"
        data-testid="Query properties-option"
        style={{ overflow: 'visible' }}
      >
        {atomPropertiesForSubMenu.map(({ title, buttons, key }) => {
          return (
            <Submenu
              {...props}
              label={title}
              data-testid={`${title}-option`}
              key={key}
              className={styles.sameGroup}
            >
              <ButtonGroup<AtomAllAttributeValue>
                buttons={buttons}
                defaultValue={getPropertyValue(key)}
                title={title}
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
          <Item
            {...props}
            data-testid="Add attachment point-option"
            onClick={handleAddAttachmentPoint}
            disabled={isAddAttachmentPointDisabled}
          >
            Add attachment point
          </Item>
        )}
      <HighlightMenu onHighlight={highlightAtomWithColor} />
      {isAtomSuperatomAttachmentPoint &&
        atomFreeAttachmentPoints.length > 0 && (
          <Item
            {...props}
            data-testid="Remove attachment point-option"
            onClick={handleRemoveAttachmentPoint}
          >
            Remove attachment point
          </Item>
        )}
      <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
        <Icon name="deleteMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>Delete</span>
      </Item>
    </>
  );
};

export default AtomMenuItems;
