import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppDispatch, useAppSelector, useLayoutMode } from 'hooks';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import {
  BaseSequenceItemRenderer,
  ModeTypes,
  NodesSelection,
  BaseMonomer,
  isTwoStrandedNodeRestrictedForHydrogenBondCreation,
  SequenceRenderer,
  EmptySequenceNode,
  BackBoneSequenceNode,
  Chain,
} from 'ketcher-core';
import { setSelectedTabIndex } from 'state/library';
import {
  setSequenceSelection,
  setIsEditMode,
  setSequenceSelectionName,
  setActivePreset,
  setActiveRnaBuilderItem,
  setIsSequenceFirstsOnlyNucleoelementsSelected,
} from 'state/rna-builder';
import {
  generateSequenceContextMenuProps,
  isEstablishHydrogenBondDisabled,
  isNodeContainHydrogenBonds,
} from 'components/contextMenu/SequenceItemContextMenu/helpers';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import {
  isAntisenseCreationDisabled,
  isAntisenseOptionHidden,
} from 'components/contextMenu/SelectedMonomersContextMenu/helpers';
import { LIBRARY_TAB_INDEX } from 'src/constants';
import { ITwoStrandedChainItem } from 'ketcher-core/dist/domain/entities/monomer-chains/ChainsCollection';

type SequenceItemContextMenuType = {
  selections?: NodesSelection;
};

export enum SequenceItemContextMenuNames {
  title = 'sequence_menu_title',
  createRnaAntisenseStrand = 'create_rna_antisense_strand',
  createDnaAntisenseStrand = 'create_dna_antisense_strand',
  modifyInRnaBuilder = 'modify_in_rna_builder',
  establishHydrogenBond = 'establish_hydrogen_bond',
  deleteHydrogenBond = 'delete_hydrogen_bond',
  editSequence = 'edit_sequence',
  startNewSequence = 'start_new_sequence',
}

export const SequenceItemContextMenu = ({
  selections,
}: SequenceItemContextMenuType) => {
  const editor = useAppSelector(selectEditor);
  const dispatch = useAppDispatch();
  const menuProps = generateSequenceContextMenuProps(selections);
  const selectedMonomers: BaseMonomer[] =
    selections
      ?.flatMap((selectionRange) => [...selectionRange])
      ?.flatMap((nodeSelection) => {
        return nodeSelection.node.monomers;
      }) || [];

  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceMode = useLayoutMode() === ModeTypes.sequence;
  const menuItems = [
    {
      name: SequenceItemContextMenuNames.title,
      title: menuProps?.title,
      isMenuTitle: true,
      disabled: true,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return (
          !props?.sequenceItemRenderer ||
          !menuProps?.isSelectedAtLeastOneNucleoelement
        );
      },
    },
    {
      name: SequenceItemContextMenuNames.createRnaAntisenseStrand,
      title: 'Create RNA antisense strand',
      disabled: isAntisenseCreationDisabled(selectedMonomers),
      hidden: () =>
        !selectedMonomers || !isAntisenseOptionHidden(selectedMonomers),
    },
    {
      name: SequenceItemContextMenuNames.createDnaAntisenseStrand,
      title: 'Create DNA antisense strand',
      disabled: isAntisenseCreationDisabled(selectedMonomers),
      hidden: () =>
        !selectedMonomers || !isAntisenseOptionHidden(selectedMonomers),
    },
    {
      name: SequenceItemContextMenuNames.modifyInRnaBuilder,
      title: 'Modify in RNA Builder...',
      disabled:
        !menuProps?.isSelectedOnlyNucleoelements || menuProps.hasAntisense,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return (
          !props?.sequenceItemRenderer ||
          !menuProps?.isSelectedAtLeastOneNucleoelement
        );
      },
    },
    {
      name: SequenceItemContextMenuNames.editSequence,
      title: 'Edit sequence',
      disabled: false,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return !props?.sequenceItemRenderer;
      },
    },
    {
      name: SequenceItemContextMenuNames.startNewSequence,
      title: 'Start new sequence',
      disabled: false,
    },
    {
      name: SequenceItemContextMenuNames.establishHydrogenBond,
      title: 'Establish Hydrogen Bonds',
      disabled: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return selections?.length === 0
          ? isTwoStrandedNodeRestrictedForHydrogenBondCreation(
              props?.sequenceItemRenderer?.twoStrandedNode,
            )
          : isEstablishHydrogenBondDisabled(selections);
      },
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return !props?.sequenceItemRenderer;
      },
    },
    {
      name: SequenceItemContextMenuNames.deleteHydrogenBond,
      title: 'Delete Hydrogen Bonds',
      disabled: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return selections?.length === 0
          ? !isNodeContainHydrogenBonds(props?.sequenceItemRenderer?.node)
          : !selections?.some((selectionRange) => {
              return selectionRange.some((selection) => {
                return isNodeContainHydrogenBonds(selection.node);
              });
            });
      },
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return !props?.sequenceItemRenderer;
      },
    },
  ];

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case SequenceItemContextMenuNames.modifyInRnaBuilder:
        editor.events.turnOnSequenceEditInRNABuilderMode.dispatch();
        dispatch(setSelectedTabIndex(LIBRARY_TAB_INDEX.RNA));
        dispatch(setIsEditMode(true));
        dispatch(setActivePreset({}));
        dispatch(setActiveRnaBuilderItem(null));
        if (
          menuProps?.selectedSequenceLabeledNodes?.length &&
          menuProps?.title
        ) {
          dispatch(setSequenceSelectionName(menuProps?.title));
          dispatch(
            setSequenceSelection(menuProps?.selectedSequenceLabeledNodes),
          );
          dispatch(
            setIsSequenceFirstsOnlyNucleoelementsSelected(
              menuProps?.isSequenceFirstsOnlyNucleoelementsSelected,
            ),
          );
        }
        break;
      case SequenceItemContextMenuNames.startNewSequence:
        editor.events.startNewSequence.dispatch(props.sequenceItemRenderer);
        break;
      case SequenceItemContextMenuNames.editSequence:
        editor.events.editSequence.dispatch(props.sequenceItemRenderer);
        break;
      case SequenceItemContextMenuNames.createRnaAntisenseStrand:
        editor.events.createAntisenseChain.dispatch(false);
        break;
      case SequenceItemContextMenuNames.createDnaAntisenseStrand:
        editor.events.createAntisenseChain.dispatch(true);
        break;
      case SequenceItemContextMenuNames.establishHydrogenBond:
        editor.events.establishHydrogenBond.dispatch(
          props.sequenceItemRenderer,
        );
        break;
      case SequenceItemContextMenuNames.deleteHydrogenBond: {
        const sequenceViewModel = SequenceRenderer.sequenceViewModel;
        const monomerToChain =
          sequenceViewModel.chainsCollection.monomerToChain;
        const antisenseChainToSelectedNodeMap = new Map<
          Chain,
          Set<ITwoStrandedChainItem>
        >();
        const selectedTwoStrandedNodes: ITwoStrandedChainItem[] =
          selections?.length
            ? selections
                .reduce(
                  (acc, selectionRange) => [...acc, ...selectionRange],
                  [],
                )
                .map((nodeSelection) => nodeSelection.twoStrandedNode)
            : [props.sequenceItemRenderer?.twoStrandedNode];

        selectedTwoStrandedNodes.forEach((selectedTwoStrandedNode) => {
          if (
            selectedTwoStrandedNode.antisenseChain &&
            selectedTwoStrandedNode.antisenseNode &&
            !(
              selectedTwoStrandedNode.antisenseNode instanceof
                EmptySequenceNode ||
              selectedTwoStrandedNode.antisenseNode instanceof
                BackBoneSequenceNode
            )
          ) {
            if (
              !antisenseChainToSelectedNodeMap.has(
                selectedTwoStrandedNode.antisenseChain,
              )
            ) {
              antisenseChainToSelectedNodeMap.set(
                selectedTwoStrandedNode.antisenseChain,
                new Set(),
              );
            }

            const antisenseChainSelectedNodes =
              antisenseChainToSelectedNodeMap.get(
                selectedTwoStrandedNode.antisenseChain,
              );

            if (!antisenseChainSelectedNodes) {
              return;
            }

            antisenseChainSelectedNodes.add(selectedTwoStrandedNode);
          }
        });

        let isGoingToDeleteAllHydrogenBondsForAnyChain = false;

        antisenseChainToSelectedNodeMap.forEach(
          (selectedTwoStrandedNodes, chain) => {
            const firstSelectedTwoStrandedNode = [
              ...selectedTwoStrandedNodes.values(),
            ][0];
            const senseChain = firstSelectedTwoStrandedNode.chain;
            const selectedAntisenseNodes = new Set(
              [...selectedTwoStrandedNodes.values()].map(
                (node) => node.antisenseNode,
              ),
            );
            const hasMoreHydrogenConnectionsThanSelected = chain.nodes.some(
              (node) => {
                return (
                  !selectedAntisenseNodes.has(node) &&
                  node.monomers.some((monomer) => {
                    return monomer.hydrogenBonds.some((hydrogenBond) => {
                      const anotherMonomer =
                        hydrogenBond.getAnotherMonomer(monomer);
                      const anotherChain =
                        anotherMonomer && monomerToChain.get(anotherMonomer);

                      return anotherChain === senseChain;
                    });
                  })
                );
              },
            );

            if (!hasMoreHydrogenConnectionsThanSelected) {
              isGoingToDeleteAllHydrogenBondsForAnyChain = true;
            }
          },
        );

        if (isGoingToDeleteAllHydrogenBondsForAnyChain) {
          editor.events.openConfirmationDialog.dispatch({
            title: 'Deletion of all Hydrogen Bonds',
            confirmationText:
              'Deleting all hydrogen bonds will cause the separation of two chains. Do you wish to proceed?',
            onConfirm: () => {
              editor.events.deleteHydrogenBond.dispatch(
                props.sequenceItemRenderer,
              );
            },
          });
        } else {
          editor.events.deleteHydrogenBond.dispatch(props.sequenceItemRenderer);
        }
        break;
      }
      default:
        break;
    }
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return ketcherEditorRootElement &&
    isSequenceMode &&
    !isSequenceEditInRNABuilderMode
    ? createPortal(
        <ContextMenu
          id={CONTEXT_MENU_ID.FOR_SEQUENCE}
          handleMenuChange={handleMenuChange}
          menuItems={menuItems}
        ></ContextMenu>,
        ketcherEditorRootElement,
      )
    : null;
};
