import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppSelector } from 'hooks';
import { selectEditor } from 'state/common';
import {
  AmbiguousMonomer,
  BaseMonomer,
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
  isRnaBaseOrAmbiguousRnaBase,
  KetAmbiguousMonomerTemplateSubType,
  RNABase,
  Sugar,
} from 'ketcher-core';
import { ContextMenu } from 'components/contextMenu/ContextMenu';

type SelectedMonomersContextMenuType = {
  selectedMonomers: BaseMonomer[];
};

const getMonomersCode = (monomers: BaseMonomer[]) => {
  return monomers
    .map((monomer) => monomer.monomerItem.props.MonomerNaturalAnalogCode)
    .sort()
    .join('');
};
const isSenseBase = (monomer: BaseMonomer | AmbiguousMonomer) => {
  const { monomerItem } = monomer;
  const isNaturalAnalogue =
    monomerItem.props.MonomerNaturalAnalogCode === 'A' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'C' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'G' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'T' ||
    monomerItem.props.MonomerNaturalAnalogCode === 'U';
  if (isNaturalAnalogue) {
    return true;
  }
  if (!monomer.monomerItem.isAmbiguous) {
    return false;
  }

  if (
    (monomer as AmbiguousMonomer).subtype ===
    KetAmbiguousMonomerTemplateSubType.MIXTURE
  ) {
    return false;
  }

  const N1 = 'ACGT';
  const N2 = 'ACGU';
  const B1 = 'CGT';
  const B2 = 'CGU';
  const D1 = 'AGT';
  const D2 = 'AGU';
  const H1 = 'ACT';
  const H2 = 'ACU';
  const K1 = 'GT';
  const K2 = 'GU';
  const W1 = 'AT';
  const W2 = 'AU';
  const Y1 = 'CT';
  const Y2 = 'CU';
  const M = 'AC';
  const R = 'AG';
  const S = 'CG';
  const V = 'ACG';
  const ambigues = [
    N1,
    N2,
    B1,
    B2,
    D1,
    D2,
    H1,
    H2,
    K1,
    K2,
    W1,
    W2,
    Y1,
    Y2,
    M,
    R,
    S,
    V,
  ];
  const code = getMonomersCode((monomer as AmbiguousMonomer).monomers);
  return ambigues.some((v) => v === code);
};

export const SelectedMonomersContextMenu = ({
  selectedMonomers,
}: SelectedMonomersContextMenuType) => {
  const editor = useAppSelector(selectEditor);
  const isAntisenseCreationDisabled = selectedMonomers?.some(
    (selectedMonomer: BaseMonomer) => {
      const rnaBaseForSugar =
        selectedMonomer instanceof Sugar &&
        getRnaBaseFromSugar(selectedMonomer);

      return (
        (selectedMonomer instanceof RNABase &&
          (selectedMonomer.hydrogenBonds.length > 0 ||
            selectedMonomer.covalentBonds.length > 1)) ||
        (isRnaBaseOrAmbiguousRnaBase(selectedMonomer) &&
          !isSenseBase(selectedMonomer)) ||
        (rnaBaseForSugar &&
          (rnaBaseForSugar.hydrogenBonds.length > 0 ||
            !isSenseBase(rnaBaseForSugar)))
      );
    },
  );

  const menuItems = [
    {
      name: 'copy',
      title: 'Copy',
    },
    {
      name: 'create_antisense_chain',
      title: 'Create Antisense Strand',
      separator: true,
      disabled: isAntisenseCreationDisabled,
      hidden: ({ props }: { props?: { selectedMonomers?: BaseMonomer[] } }) => {
        return !props?.selectedMonomers?.some((selectedMonomer) => {
          return (
            (selectedMonomer instanceof RNABase &&
              getSugarFromRnaBase(selectedMonomer)) ||
            (selectedMonomer instanceof Sugar &&
              getRnaBaseFromSugar(selectedMonomer))
          );
        });
      },
    },
    {
      name: 'delete',
      title: 'Delete',
    },
  ];

  const handleMenuChange = ({ id }: ItemParams) => {
    switch (id) {
      case 'copy':
        editor.events.copySelectedStructure.dispatch();
        break;
      case 'create_antisense_chain':
        editor.events.createAntisenseChain.dispatch();
        break;
      case 'delete':
        editor.events.deleteSelectedStructure.dispatch();
        break;
      default:
        break;
    }
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return (
    ketcherEditorRootElement &&
    createPortal(
      <ContextMenu
        id={CONTEXT_MENU_ID.FOR_SELECTED_MONOMERS}
        handleMenuChange={handleMenuChange}
        menuItems={menuItems}
      ></ContextMenu>,
      ketcherEditorRootElement,
    )
  );
};
