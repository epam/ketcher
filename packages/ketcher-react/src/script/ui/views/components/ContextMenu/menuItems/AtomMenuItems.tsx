import { type FC, useMemo } from 'react';
import { Item, Submenu } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import MenuSeparator from '../MenuSeparator';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useDelete from '../hooks/useDelete';
import useMarkAs from '../hooks/useMarkAs';
import type {
  AtomContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { updateSelectedAtoms } from 'src/script/ui/state/modal/atoms';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import ButtonGroup from '../../../../../../components/ToggleButtonGroup/ToggleButtonGroup';
import {
  type AtomAttributeName,
  type AtomAllAttributeValue,
  type AtomQueryPropertiesName,
  type AtomQueryProperties,
  type AtomAllAttributeName,
  atomGetAttr,
  Atom,
  ketcherProvider,
} from 'ketcher-core';
import { atom } from '../../../../data/schema/struct-schema';
import { resolveTranslatableText } from 'src/script/ui/utils';
import styles from '../ContextMenu.module.less';
import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { Icon } from 'components';
import useMakeAttachmentPointMenuItems from '../hooks/useMakeAttachmentPointMenuItems';
import clsx from 'clsx';

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

function getAtomPropertiesForSubMenu(t: TFunction): {
  title: string;
  key: AtomAllAttributeName;
  buttons: { label: string; value: AtomAllAttributeValue }[];
}[] {
  return [
    {
      title: resolveTranslatableText(ringBondCount.title, t) ?? '',
      key: 'ringBondCount',
      buttons:
        ringBondCount.enumNames?.map((label, id) => ({
          label: resolveTranslatableText(label, t) ?? label,
          value: ringBondCount.enum?.[id] as AtomAllAttributeValue,
        })) ?? [],
    },
    {
      title: resolveTranslatableText(hCount.title, t) ?? '',
      key: 'hCount',
      buttons:
        hCount.enumNames?.map((label, id) => ({
          label: resolveTranslatableText(label, t) ?? label,
          value: hCount.enum?.[id] as AtomAllAttributeValue,
        })) ?? [],
    },
    {
      title: resolveTranslatableText(substitutionCount.title, t) ?? '',
      key: 'substitutionCount',
      buttons:
        substitutionCount.enumNames?.map((label, id) => ({
          label: resolveTranslatableText(label, t) ?? label,
          value: substitutionCount.enum?.[id] as AtomAllAttributeValue,
        })) ?? [],
    },
    {
      title: resolveTranslatableText(unsaturatedAtom.title, t) ?? '',
      key: 'unsaturatedAtom',
      buttons: [
        { label: t('components:contextMenu.unsaturated'), value: 1 },
        { label: t('components:contextMenu.saturated'), value: 0 },
      ],
    },
    {
      title: resolveTranslatableText(implicitHCount.title, t) ?? '',
      key: 'implicitHCount',
      buttons:
        implicitHCount.enumNames?.map((label, id) => ({
          label: resolveTranslatableText(label, t) ?? label,
          value: implicitHCount.enum?.[id] as AtomAllAttributeValue,
        })) ?? [],
    },
    ...properties.map((name) => ({
      title: resolveTranslatableText(atom.properties[name].title, t) ?? '',
      key: name,
      buttons:
        atom.properties[name].enumNames?.map((label: string, id: number) => ({
          label: resolveTranslatableText(label, t) ?? label,
          value: atom.properties[name].enum?.[id] as AtomAllAttributeValue,
        })) ?? [],
    })),
  ];
}

const AtomMenuItems: FC<MenuItemsProps<AtomContextMenuProps>> = (props) => {
  const { t } = useTranslation(['components', 'common']);
  const atomPropertiesForSubMenu = useMemo(
    () => getAtomPropertiesForSubMenu(t),
    [t],
  );
  const [handleEdit] = useAtomEdit();
  const [handleStereo, stereoDisabled] = useAtomStereo();
  const handleDelete = useDelete();
  const {
    handler: handleMarkAs,
    isVisible: markAsIsVisible,
    isDisabled: markAsIsDisabled,
  } = useMarkAs();
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
  const isAtomSuperatomLeavingGroup = Atom.isSuperatomLeavingGroupAtom(
    struct,
    selectedAtomId,
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

  const makeAttachmentPointMenuItems = useMakeAttachmentPointMenuItems({
    props,
    selectedAtomId,
    editor,
  });

  if (isAtomSuperatomLeavingGroup && onlyOneAtomSelected) {
    return (
      <>
        <HighlightMenu onHighlight={highlightAtomWithColor} />
        <MenuSeparator />
        <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
          <Icon name="deleteMenu" className={styles.icon} />
          <span className={styles.contextMenuText}>{t('common:delete')}</span>
        </Item>
      </>
    );
  }

  const editMenuItemTitle = props.propsFromTrigger?.extraItemsSelected
    ? 'Edit selected atoms...'
    : 'Edit...';
  const editMenuItemLabel = props.propsFromTrigger?.extraItemsSelected
    ? t('components:contextMenu.editSelectedAtomsEllipsis')
    : t('components:contextMenu.editEllipsis');

  const disabledForMonomerCreation = editor.isMonomerCreationWizardActive;
  const showMarkAsMenu = markAsIsVisible();
  const markAsDisabled = markAsIsDisabled();

  return (
    <>
      {showMarkAsMenu && (
        <Submenu
          {...props}
          data-testid="Mark as a...-option"
          label={t('components:contextMenu.markAsMenu')}
          disabled={markAsDisabled}
          className={styles.subMenu}
        >
          <Item
            {...props}
            data-testid="Mark as Base-option"
            onClick={handleMarkAs('base')}
          >
            <Icon
              name="base"
              className={clsx(styles.icon, styles.markAsComponentIcon)}
            />
            <span>{t('common:monomerType.base')}</span>
          </Item>
          <Item
            {...props}
            data-testid="Mark as Sugar-option"
            onClick={handleMarkAs('sugar')}
          >
            <Icon
              name="sugar"
              className={clsx(styles.icon, styles.markAsComponentIcon)}
            />
            <span>{t('common:monomerType.sugar')}</span>
          </Item>
          <Item
            {...props}
            data-testid="Mark as Phosphate-option"
            onClick={handleMarkAs('phosphate')}
          >
            <Icon
              name="phosphate"
              className={clsx(styles.icon, styles.markAsComponentIcon)}
            />
            <span>{t('common:monomerType.phosphate')}</span>
          </Item>
        </Submenu>
      )}
      {makeAttachmentPointMenuItems && (
        <>
          {makeAttachmentPointMenuItems}
          <MenuSeparator />
        </>
      )}
      <Item
        {...props}
        data-testid={editMenuItemTitle.concat('-option')}
        onClick={handleEdit}
      >
        <Icon name="editMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>{editMenuItemLabel}</span>
      </Item>
      <Item
        {...props}
        data-testid="Enhanced stereochemistry...-option"
        disabled={stereoDisabled}
        onClick={handleStereo}
      >
        {t('components:contextMenu.enhancedStereochemistryEllipsis')}
      </Item>
      <Submenu
        {...props}
        label={t('components:contextMenu.queryPropertiesMenu')}
        data-testid="Query properties-option"
        style={{ overflow: 'visible' }}
        disabled={disabledForMonomerCreation}
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
              />
            </Submenu>
          );
        })}
      </Submenu>
      <HighlightMenu
        onHighlight={highlightAtomWithColor}
        disabled={disabledForMonomerCreation}
      />
      <MenuSeparator />
      <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
        <Icon name="deleteMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>{t('common:delete')}</span>
      </Item>
    </>
  );
};

export default AtomMenuItems;
