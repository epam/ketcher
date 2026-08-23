import { Base } from '@tests/pages/constants/monomers/Bases';
import { Page, test, expect } from '@fixtures';
import {
  clickInTheMiddleOfTheCanvas,
  MacroFileType,
  MonomerType,
  openFileAndAddToCanvasMacro,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  SymbolType,
} from '@utils';
import { selectAllStructuresOnCanvas } from '@utils/canvas/selectSelection';
import {
  getMonomerLocator,
  getSymbolLocator,
} from '@utils/macromolecules/monomer';
import {
  bondTwoMonomers,
  getBondLocator,
} from '@utils/macromolecules/polymerBond';
import {
  MacroBondType,
  MacroBondTool,
} from '@tests/pages/constants/bondSelectionTool/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import { SequenceSymbolOption } from '@tests/pages/constants/contextMenu/Constants';
import { MacromoleculesTopToolbar } from '@tests/pages/macromolecules/MacromoleculesTopToolbar';
import { LayoutMode } from '@tests/pages/constants/macromoleculesTopToolbar/Constants';
import { ConfirmYourActionDialog } from '@tests/pages/macromolecules/canvas/ConfirmYourActionDialog';
import { CommonLeftToolbar } from '@tests/pages/common/CommonLeftToolbar';
import { SelectionToolType } from '@tests/pages/constants/areaSelectionTool/Constants';

let page: Page;

test.beforeAll(async ({ initSequenceCanvas }) => {
  page = await initSequenceCanvas();
});

test.beforeEach(async ({ SequenceCanvas: _ }) => {});

test.afterEach(async () => {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Flex);
});

test.afterAll(async ({ closePage }) => {
  await closePage();
});

interface IMonomerForHydrogenBondTest {
  Id: number;
  ContentType: MacroFileType;
  SenseForm: string;
  AntiSenseForm: string;
  Description: string;
}
const sequencesForHydrogenBondTests: IMonomerForHydrogenBondTest[] = [
  {
    Id: 1,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](U)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](U)}$RNA2,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'DNA(U)',
  },
  {
    Id: 2,
    ContentType: MacroFileType.HELM,
    SenseForm: 'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R(T)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R(T)}$RNA2,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'RNA(T)',
  },
  {
    Id: 3,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,T)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,T)}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous DNA(N)',
  },
  {
    Id: 4,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,U)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G,U)}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous RNA(N)',
  },
  {
    Id: 5,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G)}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[dR](A,C,G)}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous RNA/DNA(V)',
  },
  {
    Id: 6,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{E}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{E}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Peptide(E)',
  },
  {
    Id: 7,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C,D)}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C,D)}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Alternative Peptide(%)',
  },
  {
    Id: 8,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C+D)}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(C+D)}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Mixed Peptide(%)',
  },
  {
    Id: 9,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(L,I)}$RNA1,PEPTIDE1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|PEPTIDE1{(L,I)}$RNA1,PEPTIDE1,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Alternative Peptide(J)',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 10,
  //   ContentType: MacroFileType.HELM,
  //   SenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[12ddR]}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
  //   AntiSenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[12ddR]}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
  //   Description: 'Sugar(12ddR)',
  // },
  {
    Id: 11,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R,[3A6])}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R,[3A6])}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Alternative Sugar(%)',
  },

  {
    Id: 12,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R+[3A6])}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{(R+[3A6])}$RNA1,RNA2,1:R1-1:R2$$$V2.0',
    Description: 'Ambiguous Mixed Sugar(%)',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 13,
  //   ContentType: MacroFileType.KetFormat,
  //   SenseForm:
  //     'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/13. Sence Base(oC64m5).ket',
  //   AntiSenseForm:
  //     'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/13. Antisense Base(oC64m5).ket',
  //   Description: 'Base(oC64m5)',
  // },
  {
    Id: 14,
    ContentType: MacroFileType.KetFormat,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/14. Sense Ambiguous Alternatives Base(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/14. Antisense Ambiguous Alternatives Base(%).ket',
    Description: 'Ambiguous Alternative Base(%)',
  },
  {
    Id: 15,
    ContentType: MacroFileType.KetFormat,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/15. Sense Ambiguous Mixed Base(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/15. Antisense Ambiguous Mixed Base(%).ket',
    Description: 'Ambiguous Mixed Base(%)',
  },
  {
    Id: 16,
    ContentType: MacroFileType.HELM,
    SenseForm: 'RNA1{[Sm6fhn]([c7io7n])P}$$$$V2.0',
    AntiSenseForm: 'RNA1{P.[Sm6fhn]([c7io7n])}$$$$V2.0',
    Description: 'Phosphate(P)',
  },
  {
    Id: 17,
    ContentType: MacroFileType.KetFormat,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/17. Sense Ambiguous Mixed Phosphate(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/17. Antisense Ambiguous Mixed Phosphate(%).ket',
    Description: 'Ambiguous Mixed Phosphate(%)',
  },
  {
    Id: 18,
    ContentType: MacroFileType.KetFormat,
    SenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/18. Sense Ambiguous Alternatives Phosphate(%).ket',
    AntiSenseForm:
      'KET/New-Sequence-Representation/MonomersForHydrogenBondTests/18. Antisense Ambiguous Alternatives Phosphate(%).ket',
    Description: 'Ambiguous Alternatives Phosphate(%)',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 19,
  //   ContentType: MacroFileType.HELM,
  //   SenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[4aPEGMal]}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
  //   AntiSenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[4aPEGMal]}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
  //   Description: 'CHEM(4aPEGMal)',
  // },
  {
    Id: 20,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL],[4aPEGMal])}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL],[4aPEGMal])}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'Ambiguous Alternative CHEM(%)',
  },
  {
    Id: 21,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL]+[4aPEGMal])}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{([sDBL]+[4aPEGMal])}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'Ambiguous Mixed CHEM(%)',
  },
  {
    Id: 22,
    ContentType: MacroFileType.HELM,
    SenseForm: 'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{*}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{*}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'Unknown monomer',
  },
  // Removed due to bug: https://github.com/epam/ketcher/issues/6736
  // {
  //   Id: 23,
  //   ContentType: MacroFileType.HELM,
  //   SenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[C1([*:1])C=CC=C([*:2])C=1 |$;_R1;;;;;_R2;$|]}$RNA1,CHEM1,1:R2-1:R1$$$V2.0',
  //   AntiSenseForm:
  //     'RNA1{[Sm6fhn]([c7io7n])}|CHEM1{[C1([*:1])C=CC=C([*:2])C=1 |$;_R1;;;;;_R2;$|]}$CHEM1,RNA1,1:R2-1:R1$$$V2.0',
  //   Description: 'Micro Molecule',
  // },
  {
    Id: 24,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{[5Br-dU]}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm: 'RNA1{[5Br-dU].[Sm6fhn]([c7io7n])}$$$$V2.0',
    Description: 'Unsplit nucleotide',
  },
  {
    Id: 25,
    ContentType: MacroFileType.HELM,
    SenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R([cl6pur])}$RNA1,RNA2,1:R2-1:R1$$$V2.0',
    AntiSenseForm:
      'RNA1{[Sm6fhn]([c7io7n])}|RNA2{R([cl6pur])}$RNA2,RNA1,1:R2-1:R1$$$V2.0',
    Description: 'RNA without natural analog (X)',
  },
];

const emptySequence: IMonomerForHydrogenBondTest = {
  Id: 1,
  ContentType: MacroFileType.HELM,
  SenseForm: 'RNA1{[Sm6fhn]([c7io7n])}$$$$V2.0',
  AntiSenseForm: 'RNA1{[Sm6fhn]([c7io7n])}$$$$V2.0',
  Description: 'Empty sequence',
};

async function setupSenseAndAntiSenseSequences(
  page: Page,
  senseSequence: IMonomerForHydrogenBondTest,
  antisenseSequence: IMonomerForHydrogenBondTest,
) {
  await MacromoleculesTopToolbar(page).selectLayoutModeTool(LayoutMode.Snake);
  if (senseSequence.ContentType === MacroFileType.HELM) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      senseSequence.SenseForm,
    );
  }
  if (antisenseSequence.ContentType === MacroFileType.HELM) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      antisenseSequence.AntiSenseForm,
    );
  }
  if (senseSequence.ContentType === MacroFileType.KetFormat) {
    await openFileAndAddToCanvasMacro(page, senseSequence.SenseForm);
  }
  if (antisenseSequence.ContentType === MacroFileType.KetFormat) {
    await openFileAndAddToCanvasMacro(page, antisenseSequence.AntiSenseForm);
  }

  const senseBase = getMonomerLocator(page, Base.c7io7n).first();
  const antisenseBase = getMonomerLocator(page, Base.c7io7n).nth(1);

  await bondTwoMonomers(
    page,
    senseBase,
    antisenseBase,
    undefined,
    undefined,
    MacroBondTool.Hydrogen,
  );
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  for (const antisenseSequence of sequencesForHydrogenBondTests) {
    test(`Case 11-${senseSequence.Id}-${antisenseSequence.Id}. [${senseSequence.Description}]---[${antisenseSequence.Description}] Establish/Delete Hydrogen Bonds checks for single monomer`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 1
       * Description: 1. Check that right clicking on a symbol that has no hydrogen bonds with a symbol bellow/above it, give the option to "Establish Hydrogen Bonds"
       *              2. Check If there are no H-bonds, the option "Delete Hydrogen Bonds" is disabled ( Requirement: 1.2 )
       *              3. Check that a hydrogen bond established between the monomer that was clicked on and the monomer placed bellow/above it ( Requirement: 1.1 )
       *              4. Check if a symbol has H-bonds with a symbol opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
       *              5. Check that if the symbol represents a nucleotide/nucleoside, a hydrogen bond established from the base (no need for a "sense base" check) ( Requirement: 1.1 )
       *              6. Check that right clicking on a symbol that has any H-bonds give the option to "Delete Hydrogen Bonds" ( Requirement: 1.2 )
       *              7. Check that clicking on "Delete Hydrogen Bonds" will remove hydrogen bonds
       * Scenario:
       * 1. Load sense and antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
       * 2. Switch to Sequence mode
       * 3. Getting sense and antisense symbol ids and locators
       * 4. Check that context menu has "Establish Hydrogen Bonds" option available and enabled ("Delete Hydrogen Bonds" option should be disabled)
       * 5. Click "Establish Hydrogen Bonds" and check that hydrogen bond was established between sense and antisense symbols
       * 6. If sense symbol is a RNA or DNA, check that all bases have hydrogen connection
       * 7. Right click on the sense symbol and check that "Establish Hydrogen Bonds" option is disabled
       * 8. Click on "Delete Hydrogen Bonds"
       * 9. Check that hydrogen bond was removed
       */

      await setupSenseAndAntiSenseSequences(
        page,
        senseSequence,
        antisenseSequence,
      );

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );

      const senseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: false,
      })
        .first()
        .getAttribute('data-symbol-id');
      const antisenseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: true,
      })
        .first()
        .getAttribute('data-symbol-id');

      const senseSymbol = await getSymbolLocator(page, {
        symbolId: senseSymbolId ?? '',
      }).first();
      const antisenseSymbol = await getSymbolLocator(page, {
        symbolId: antisenseSymbolId ?? '',
      }).first();

      // 1. Check that right clicking on a symbol that has no hydrogen bonds with a symbol bellow/above it, give the option to "Establish Hydrogen Bonds"
      await clickInTheMiddleOfTheCanvas(page);
      expect(
        await ContextMenu(page, senseSymbol).isOptionEnabled(
          SequenceSymbolOption.EstablishHydrogenBonds,
        ),
      ).toBeTruthy();
      // 2. Check If there are no H-bonds, the option "Delete Hydrogen Bonds" is disabled ( Requirement: 1.2 )
      await clickInTheMiddleOfTheCanvas(page);
      expect(
        await ContextMenu(page, senseSymbol).isOptionEnabled(
          SequenceSymbolOption.DeleteHydrogenBonds,
        ),
      ).toBeFalsy();

      // 3. Check that a hydrogen bond established between the monomer that was clicked on and the monomer placed bellow/above it ( Requirement: 1.1 )
      await clickInTheMiddleOfTheCanvas(page);
      await ContextMenu(page, senseSymbol).click(
        SequenceSymbolOption.EstablishHydrogenBonds,
      );
      const senseHydrogenConnectionNumber = await senseSymbol.getAttribute(
        'data-hydrogen-connection-number',
      );
      const antisenseHydrogenConnectionNumber =
        await antisenseSymbol.getAttribute('data-hydrogen-connection-number');
      expect(senseHydrogenConnectionNumber).toBe('1');
      expect(antisenseHydrogenConnectionNumber).toBe('1');

      // 4. Check if a symbol has H-bonds with a symbol opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
      // Dirty hack to make sure that the symbol got menu opened for it
      await senseSymbol.dblclick({ force: true });
      await clickInTheMiddleOfTheCanvas(page);
      await clickInTheMiddleOfTheCanvas(page);
      expect(
        await ContextMenu(page, senseSymbol).isOptionEnabled(
          SequenceSymbolOption.EstablishHydrogenBonds,
        ),
      ).toBeFalsy();

      // 5. Check that if the symbol represents a nucleotide/nucleoside, a hydrogen bond established from the base (no need for a "sense base" check) ( Requirement: 1.1 )
      const senseSymbolType = await senseSymbol.getAttribute(
        'data-symbol-type',
      );
      if (
        senseSymbolType === SymbolType.RNA ||
        senseSymbolType === SymbolType.DNA
      ) {
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Flex,
        );

        const hydrogenBondsAll = getBondLocator(page, {
          bondType: MacroBondType.Hydrogen,
        });

        const basesWithHydrogenConnection = getMonomerLocator(page, {
          monomerType: MonomerType.Base,
          hydrogenConnectionNumber: 1,
        });
        const basesAll = getMonomerLocator(page, {
          monomerType: MonomerType.Base,
        });
        // All bases should have hydrogen connection
        expect(await basesWithHydrogenConnection.count()).toBe(
          await basesAll.count(),
        );
        // All hydrogen bonds should be present (two bonds in total)
        expect(await hydrogenBondsAll.count()).toBe(2);
        await MacromoleculesTopToolbar(page).selectLayoutModeTool(
          LayoutMode.Sequence,
        );
      }

      // 6. Check that right clicking on a symbol that has any H-bonds give the option to "Delete Hydrogen Bonds" ( Requirement: 1.2 )
      await clickInTheMiddleOfTheCanvas(page);
      expect(
        await ContextMenu(page, senseSymbol).isOptionEnabled(
          SequenceSymbolOption.DeleteHydrogenBonds,
        ),
      ).toBeTruthy();

      // 7. Check that clicking on "Delete Hydrogen Bonds" will remove hydrogen bond
      await clickInTheMiddleOfTheCanvas(page);
      await ContextMenu(page, senseSymbol).click(
        SequenceSymbolOption.DeleteHydrogenBonds,
      );
      expect(
        await senseSymbol.getAttribute('data-hydrogen-connection-number'),
      ).toBe('0');
      expect(
        await antisenseSymbol.getAttribute('data-hydrogen-connection-number'),
      ).toBe('0');
    });
  }
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  for (const antisenseSequence of sequencesForHydrogenBondTests) {
    test(`Case 12-${senseSequence.Id}-${antisenseSequence.Id}. [${senseSequence.Description}]---[${antisenseSequence.Description}] Establish/Delete Hydrogen Bonds checks for multipal monomers`, async () => {
      /*
       * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 2
       * Description: 1. Check if multiple monomers/symbols are selected and at least one of them does not have hydrogen bonds established with the monomer/symbol above/bellow it the option "Establish Hydrogen Bonds" available from the r-click menu ( Requirement: 1.3 )
       *              2. Check if multiple monomers/symbols are selected and all symbols have H-bonds established with the monomer/symbol above/bellow it the option "Establish Hydrogen Bonds" disabled from the r-click menu ( Requirement: 1.3 )
       *              3. Check If multiple monomers are selected, and any of them have hydrogen bonds, the option "Delete Hydrogen Bonds" available in the r-click menu ( Requirement: 1.4 )
       *              4. Check If multiple monomers are selected, and selected symbols have no H-bonds, the option "Delete Hydrogen Bonds" disabled in the r-click menu ( Requirement: 1.4 )
       *              5. Verify warning message on deleting all hydrogen bonds between two chains ( Requirement: 1.5 )
       * Scenario:
       * 1. Load sense and antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
       * 2. Switch to Sequence mode
       * 3. Select all symbols and check that context menu has "Establish Hydrogen Bonds" option available and enabled ("Delete Hydrogen Bonds" option should be disabled)
       * 4. Establish hydrogen bonds between all selected symbols
       * 5. Select all symbols and check that context menu has "Establish Hydrogen Bonds" disabled
       * 6. Select all symbols, call context menu and click "Delete Hydrogen Bonds" to delete all hydrogen bonds
       * 7. Select all symbols and check that context menu has "Delete Hydrogen Bonds" disabled
       */

      await setupSenseAndAntiSenseSequences(
        page,
        senseSequence,
        antisenseSequence,
      );

      await MacromoleculesTopToolbar(page).selectLayoutModeTool(
        LayoutMode.Sequence,
      );
      await CommonLeftToolbar(page).areaSelectionTool(
        SelectionToolType.Rectangle,
      );

      const senseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: false,
      })
        .first()
        .getAttribute('data-symbol-id');
      const antisenseSymbolId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 0,
        isAntisense: true,
      })
        .first()
        .getAttribute('data-symbol-id');

      const senseSymbolWithHBondId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 1,
        isAntisense: false,
      })
        .first()
        .getAttribute('data-symbol-id');
      const antisenseSymbolWithHBondId = await getSymbolLocator(page, {
        hydrogenConnectionNumber: 1,
        isAntisense: true,
      })
        .first()
        .getAttribute('data-symbol-id');

      const senseSymbol = getSymbolLocator(page, {
        symbolId: senseSymbolId ?? '',
      }).first();
      const antisenseSymbol = getSymbolLocator(page, {
        symbolId: antisenseSymbolId ?? '',
      }).first();
      const senseSymbolWithHBond = getSymbolLocator(page, {
        symbolId: senseSymbolWithHBondId ?? '',
      }).first();
      const antisenseSymbolWithHBond = getSymbolLocator(page, {
        symbolId: antisenseSymbolWithHBondId ?? '',
      }).first();

      // 1. Check if multiple monomers/symbols are selected and at least one of them does not have hydrogen bonds established
      //    with the monomer/symbol above/bellow it the option "Establish Hydrogen Bonds" available from the r-click menu ( Requirement: 1.3 )
      await clickInTheMiddleOfTheCanvas(page);
      await selectAllStructuresOnCanvas(page);
      expect(
        await ContextMenu(page, senseSymbolWithHBond).isOptionEnabled(
          SequenceSymbolOption.EstablishHydrogenBonds,
        ),
      ).toBe(true);

      // 3. Check If multiple monomers are selected, and any of them have hydrogen bonds, the option "Delete Hydrogen Bonds"
      //    available in the r-click menu ( Requirement: 1.4 )
      await clickInTheMiddleOfTheCanvas(page);
      await selectAllStructuresOnCanvas(page);
      expect(
        await ContextMenu(page, senseSymbol).isOptionEnabled(
          SequenceSymbolOption.DeleteHydrogenBonds,
        ),
      ).toBeTruthy();

      // 2. Check if multiple monomers/symbols are selected and all symbols have H-bonds established with the monomer/symbol
      //    above/bellow it the option "Establish Hydrogen Bonds" disabled from the r-click menu ( Requirement: 1.3 )
      await clickInTheMiddleOfTheCanvas(page);
      await selectAllStructuresOnCanvas(page);
      await ContextMenu(page, senseSymbolWithHBond).click(
        SequenceSymbolOption.EstablishHydrogenBonds,
      );
      await clickInTheMiddleOfTheCanvas(page);
      await selectAllStructuresOnCanvas(page);
      expect(
        await ContextMenu(page, antisenseSymbol).isOptionEnabled(
          SequenceSymbolOption.EstablishHydrogenBonds,
        ),
      ).toBeFalsy();

      // 4. Check If multiple monomers are selected, and selected symbols have no H-bonds, the option "Delete Hydrogen Bonds"
      //    disabled in the r-click menu ( Requirement: 1.4 )
      await clickInTheMiddleOfTheCanvas(page);
      await selectAllStructuresOnCanvas(page);
      await ContextMenu(page, antisenseSymbol).click(
        SequenceSymbolOption.DeleteHydrogenBonds,
      );
      // 5. Verify warning message on deleting all hydrogen bonds between two chains ( Requirement: 1.5 )
      await ConfirmYourActionDialog(page).yes();
      await clickInTheMiddleOfTheCanvas(page);
      await selectAllStructuresOnCanvas(page);
      expect(
        await ContextMenu(page, antisenseSymbolWithHBond).isOptionEnabled(
          SequenceSymbolOption.DeleteHydrogenBonds,
        ),
      ).toBeFalsy();
    });
  }
}

for (const senseSequence of sequencesForHydrogenBondTests) {
  test(`Case 13-${senseSequence.Id}. ${senseSequence.Description} - Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled`, async () => {
    /*
     * Test case: https://github.com/epam/ketcher/issues/6722 - Test case 3
     * Description: Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
     * Scenario:
     * 1. Load sense and empty antisense sequences (and connect their c7io7n bases with hydrogen bond to make sence/antisense sequence)
     * 2. Switch to Sequence mode
     * 3. Getting sense and antisense symbol ids and locators
     * 4. Open context menu for sense symbol and check that context menu has "Establish Hydrogen Bonds" option disabled
     */

    await setupSenseAndAntiSenseSequences(page, senseSequence, emptySequence);

    await MacromoleculesTopToolbar(page).selectLayoutModeTool(
      LayoutMode.Sequence,
    );
    await CommonLeftToolbar(page).areaSelectionTool(
      SelectionToolType.Rectangle,
    );

    const senseSymbolId = await getSymbolLocator(page, {
      hydrogenConnectionNumber: 0,
      isAntisense: false,
    })
      .first()
      .getAttribute('data-symbol-id');

    const senseSymbol = getSymbolLocator(page, {
      symbolId: senseSymbolId ?? '',
    }).first();

    // Check if there is no monomer opposite it, the option "Establish Hydrogen Bonds" disabled ( Requirement: 1.1 )
    await clickInTheMiddleOfTheCanvas(page);
    expect(
      await ContextMenu(page, senseSymbol).isOptionEnabled(
        SequenceSymbolOption.EstablishHydrogenBonds,
      ),
    ).toBeFalsy();
  });
}
