/* eslint-disable max-len */
/* eslint-disable no-magic-numbers */
import { Page, test, expect } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  MacroFileType,
  selectAllStructuresOnCanvas,
  MonomerType,
  selectFlexLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
} from '@utils';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { CommonTopRightToolbar } from '@tests/pages/common/CommonTopRightToolbar';
import { getMonomerLocator } from '@utils/macromolecules/monomer';
import {
  ModifyAminoAcidsOption,
  MonomerOption,
} from '@tests/pages/constants/contextMenu/Constants';
import { ContextMenu } from '@tests/pages/common/ContextMenu';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await CommonTopRightToolbar(page).turnOnMacromoleculesEditor();
  await selectFlexLayoutModeTool(page);
});

test.afterEach(async () => {
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');
  await CommonTopLeftToolbar(page).clearCanvas();
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

interface ICommonPart {
  Description: string;
  shouldFail?: boolean;
  issueNumber?: string;
  pageReloadNeeded?: boolean;
  differentHELMExport?: string;
}

type IHELMStringOrKetFile =
  | (ICommonPart & { HELMString: string; KETString?: never })
  | (ICommonPart & { KETFile: string; HELMString?: never });

const aminoAcidsForPhosphorylation: IHELMStringOrKetFile[] = [
  {
    Description:
      '1. Phosphorylation operation for S natural analog amino acid group',
    HELMString:
      'PEPTIDE1{S.[D-Dap].[Dap].[dS].[DSerBn].[DSertB]}|PEPTIDE2{[Hse].[meS].[Ser_Bn].[SerPO3].[SertBu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '2. Phosphorylation operation for T natural analog amino acid group',
    HELMString:
      'PEPTIDE1{T.[aThr].[D-aThr]}|PEPTIDE2{[meT].[dT].[dThrol]}|PEPTIDE3{[ThrPO3].[xiThr].[Thr-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair$$$V2.0',
  },
  {
    Description:
      '3. Phosphorylation operation for Y natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAnTyr].Y.[aMeTy3].[aMeTyr].[D-nTyr]}|PEPTIDE2{[TyrabD].[TyrPh4].[TyrPO3].[TyrSO3].[TyrtBu].[DTyr3O]}|PEPTIDE3{[DTyrEt].[DTyrMe].[dY].[meY].[nTyr].[Tyr_3I]}|PEPTIDE4{[Tyr_Bn].[Tyr_Me].[Tyr26d].[Tyr35d].[Tyr3NO].[Tyr3OH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE3,PEPTIDE4,6:pair-6:pair$$$V2.0',
  },
];

const aminoAcidsForSideChainAcetylation: IHELMStringOrKetFile[] = [
  {
    Description:
      '1. Side chain acetylation operation for K natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DALys].K.[Aad].[D-Orn].[dK].[Dpm]}|PEPTIDE2{[Hyl5xi].[Lys_Ac].[LysBoc].[LysiPr].[Lys-al]}|PEPTIDE3{[LysMe3].[meK].[Orn].[Lys-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
];

const aminoAcidsForCitrullination: IHELMStringOrKetFile[] = [
  {
    Description:
      '1. Citrullination operation for R natural analog amino acid group',
    HELMString:
      'PEPTIDE1{R.[Cit].[Arg-al]}|PEPTIDE2{[D-Cit].[D-hArg].[DhArgE]}|PEPTIDE3{[dR].[Har].[hArg]}|PEPTIDE4{[LhArgE].[meR]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair$$$V2.0',
  },
];

const aminoAcidsForHydroxylation: IHELMStringOrKetFile[] = [
  {
    Description:
      '1. Hydroxylation operation for P natural analog amino acid group',
    HELMString:
      'PEPTIDE1{P.[aHyp].[aMePro].[Aze].[D-aHyp].[D-Hyp]}|PEPTIDE2{[meP].[D-Thz].[dP].[Hyp].[Mhp].[DProol]}|PEPTIDE3{[xiHyp].[Thz].[Pro-al]}|PEPTIDE4{[Pro-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair$$$V2.0',
  },
  {
    Description:
      '2. Hydroxylation operation for K natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DALys].K.[Aad].[D-Orn].[dK].[Dpm]}|PEPTIDE2{[Hyl5xi].[Lys_Ac].[LysBoc].[LysiPr].[Lys-al]}|PEPTIDE3{[LysMe3].[meK].[Orn].[Lys-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
];

const aminoAcidsForNMethylation: IHELMStringOrKetFile[] = [
  {
    Description:
      '1. N-methylation operation for A natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[L-OAla].A.[1Nal].[2Nal].[3Pal].[4Pal].[Abu].[bAla].[Ala-ol]}|PEPTIDE2{[DAlaol].[Cya].[D-1Nal].[D-2Nal].[D-2Pal].[D-2Thi].[D-3Pal].[D-Abu].[Ala-al]}|PEPTIDE3{[D-OAla].[dA].[Dha].[meA].[NMebAl].[Thi].[Tza].[Cha].[D-Cha]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE1,PEPTIDE2,7:pair-7:pair|PEPTIDE2,PEPTIDE3,7:pair-7:pair|PEPTIDE1,PEPTIDE2,8:pair-8:pair|PEPTIDE2,PEPTIDE3,8:pair-8:pair|PEPTIDE1,PEPTIDE2,9:pair-9:pair|PEPTIDE2,PEPTIDE3,9:pair-9:pair$$$V2.0',
  },
  {
    Description:
      '2. N-methylation operation for C natural analog amino acid group',
    HELMString:
      'PEPTIDE1{C.[Cys_Bn].[Cys_Me]}|PEPTIDE2{[DACys].[dC].[Edc]}|PEPTIDE3{[Hcy].[meC]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '3. N-methylation operation for D natural analog amino acid group',
    HELMString:
      'PEPTIDE1{D.[AspOMe].[D*]}|PEPTIDE2{[dD].[meD]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '4. N-methylation operation for E natural analog amino acid group',
    HELMString:
      'PEPTIDE1{E.[D-gGlu].[dE]}|PEPTIDE2{[gGlu].[Gla].[meE]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
  },
  {
    Description:
      '5. N-methylation operation for F natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAhPhe].F.[aMePhe].[Bip].[Bpa].[D-hPhe].[dF].[DPhe4C].[Phe-al]}|PEPTIDE2{[DAPhg3].[DPhe4F].[DPhe4u].[hPhe].[meF].[Phe_2F].[Phe_3F].[Phe_4F].[Phe_4I]}|PEPTIDE3{[Phe2Me].[Phe34d].[Phe3Cl].[Phe4Br].[Phe4Cl].[Phe4Me].[Phe4NH].[Phe4NO].[Phe-ol]}|PEPTIDE4{[PhLA].[Phe4SD].[PheaDH].[Phebbd].[PheNO2]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE1,PEPTIDE2,7:pair-7:pair|PEPTIDE1,PEPTIDE2,8:pair-8:pair|PEPTIDE1,PEPTIDE2,9:pair-9:pair|PEPTIDE2,PEPTIDE3,9:pair-9:pair|PEPTIDE2,PEPTIDE3,8:pair-8:pair|PEPTIDE2,PEPTIDE3,7:pair-7:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '6. N-methylation operation for G natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAGlyB].G.[Chg].[D-Chg].[D-Phg].[D-Pyr]}|PEPTIDE2{[DAGlyC].[DAGlyO].[Glyall].[GlycPr].[meG].[DPhgol]}|PEPTIDE3{[DAGlyP].[Phg].[Pyr].[Phg-ol]}|PEPTIDE4{[DAGlyT].[Gly-ol]}|PEPTIDE5{[DAPhg4].[Gly-al]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE4,PEPTIDE5,1:pair-1:pair|PEPTIDE4,PEPTIDE5,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '7. N-methylation operation for H natural analog amino acid group',
    HELMString:
      'PEPTIDE1{H.[dH].[DHis1B]}|PEPTIDE2{[Hhs].[His1Bn].[His1Me]}|PEPTIDE3{[His3Me].[meH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '8. N-methylation operation for I natural analog amino acid group',
    HELMString:
      'PEPTIDE1{I.[aIle].[D-aIle]}|PEPTIDE2{[dI].[DxiIle].[meI]}|PEPTIDE3{[xiIle]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '9. N-methylation operation for K natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DALys].K.[Aad].[D-Orn].[dK].[Dpm]}|PEPTIDE2{[Hyl5xi].[Lys_Ac].[LysBoc].[LysiPr].[Lys-al]}|PEPTIDE3{[LysMe3].[meK].[Orn].[Lys-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '10. N-methylation operation for L natural analog amino acid group',
    HELMString:
      'PEPTIDE1{L.[Ar5c].[D-Nle]}|PEPTIDE2{[DALeu].[dL].[Leu-al]}|PEPTIDE3{[Nle].[meL].[Leu-ol]}|PEPTIDE4{[OLeu].[tLeu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '11. N-methylation operation for M natural analog amino acid group',
    HELMString:
      'PEPTIDE1{M.[dM].[DMetSO]}|PEPTIDE2{[meM].[Met_O].[Met_O2]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
  },
  {
    Description:
      '12. N-methylation operation for N natural analog amino acid group',
    HELMString:
      'PEPTIDE1{N.[dN]}|PEPTIDE2{[meN].[Asp-al]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '13. N-methylation operation for O natural analog amino acid group',
    HELMString:
      'PEPTIDE1{O.[dO]}|PEPTIDE2{[meO]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '14.1 N-methylation operation for P natural analog amino acid group - part 1',
    HELMString:
      'PEPTIDE1{P}|PEPTIDE2{[aHyp]}|PEPTIDE3{[aMePro]}|PEPTIDE4{[Aze]}|PEPTIDE5{[D-aHyp]}|PEPTIDE6{[D-Hyp]}|PEPTIDE7{[meP]}|PEPTIDE8{[D-Thz]}|PEPTIDE9{[dP]}|PEPTIDE10{[Hyp]}$PEPTIDE1,PEPTIDE2,1:R2-1:R2|PEPTIDE3,PEPTIDE4,1:R2-1:R2|PEPTIDE5,PEPTIDE6,1:R2-1:R2|PEPTIDE7,PEPTIDE8,1:R2-1:R2|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE4,PEPTIDE5,1:pair-1:pair|PEPTIDE6,PEPTIDE7,1:pair-1:pair|PEPTIDE9,PEPTIDE10,1:R2-1:R2|PEPTIDE8,PEPTIDE9,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '14.2 N-methylation operation for P natural analog amino acid group - part 2',
    HELMString:
      'PEPTIDE1{[Mhp]}|PEPTIDE2{[Thz]}|PEPTIDE3{[Pro-al]}|PEPTIDE4{[Pro-ol]}|PEPTIDE5{[xiHyp]}|PEPTIDE6{[DProol]}$PEPTIDE1,PEPTIDE2,1:R2-1:R2|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE4,PEPTIDE5,1:pair-1:pair|PEPTIDE5,PEPTIDE6,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '15. N-methylation operation for Q natural analog amino acid group',
    HELMString:
      'PEPTIDE1{Q.[dQ]}|PEPTIDE2{[meQ]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '16. N-methylation operation for R natural analog amino acid group',
    HELMString:
      'PEPTIDE1{R.[Cit].[Arg-al]}|PEPTIDE2{[D-Cit].[D-hArg].[DhArgE]}|PEPTIDE3{[dR].[Har].[hArg]}|PEPTIDE4{[LhArgE].[meR]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '17. N-methylation operation for S natural analog amino acid group',
    HELMString:
      'PEPTIDE1{S.[D-Dap].[Dap].[dS].[DSerBn].[DSertB]}|PEPTIDE2{[Hse].[meS].[Ser_Bn].[SerPO3].[SertBu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '18. N-methylation operation for T natural analog amino acid group',
    HELMString:
      'PEPTIDE1{T.[aThr].[D-aThr]}|PEPTIDE2{[meT].[dT].[dThrol]}|PEPTIDE3{[ThrPO3].[xiThr].[Thr-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '19. N-methylation operation for U natural analog amino acid group',
    HELMString:
      'PEPTIDE1{U.[dU]}|PEPTIDE2{[meU]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '20. N-methylation operation for V natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[D-OVal].V.[D-Nva].[D-Pen].[DaMeAb]}|PEPTIDE2{[L-OVal].[dV].[Iva].[meV]}|PEPTIDE3{[Nva].[Pen].[Val3OH].[Val-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair$$$V2.0',
  },
  {
    Description:
      '21. N-methylation operation for W natural analog amino acid group',
    HELMString:
      'PEPTIDE1{W.[DTrp2M].[DTrpFo]}|PEPTIDE2{[dW].[Kyn].[meW]}|PEPTIDE3{[Trp_Me].[Trp5OH].[TrpOme]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '22. N-methylation operation for Y natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAnTyr].Y.[aMeTy3].[aMeTyr].[D-nTyr]}|PEPTIDE2{[TyrabD].[TyrPh4].[TyrPO3].[TyrSO3].[TyrtBu].[DTyr3O]}|PEPTIDE3{[DTyrEt].[DTyrMe].[dY].[meY].[nTyr].[Tyr_3I]}|PEPTIDE4{[Tyr_Bn].[Tyr_Me].[Tyr26d].[Tyr35d].[Tyr3NO].[Tyr3OH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE3,PEPTIDE4,6:pair-6:pair$$$V2.0',
  },
];

const aminoAcidsForInversion: IHELMStringOrKetFile[] = [
  {
    Description: '1. Inversion operation for A natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[L-OAla].A.[1Nal].[2Nal].[3Pal].[4Pal].[Abu].[bAla].[Ala-ol]}|PEPTIDE2{[DAlaol].[Cya].[D-1Nal].[D-2Nal].[D-2Pal].[D-2Thi].[D-3Pal].[D-Abu].[Ala-al]}|PEPTIDE3{[D-OAla].[dA].[Dha].[meA].[NMebAl].[Thi].[Tza].[Cha].[D-Cha]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE1,PEPTIDE2,7:pair-7:pair|PEPTIDE2,PEPTIDE3,7:pair-7:pair|PEPTIDE1,PEPTIDE2,8:pair-8:pair|PEPTIDE2,PEPTIDE3,8:pair-8:pair|PEPTIDE1,PEPTIDE2,9:pair-9:pair|PEPTIDE2,PEPTIDE3,9:pair-9:pair$$$V2.0',
  },
  {
    Description: '2. Inversion operation for C natural analog amino acid group',
    HELMString:
      'PEPTIDE1{C.[Cys_Bn].[Cys_Me]}|PEPTIDE2{[DACys].[dC].[Edc]}|PEPTIDE3{[Hcy].[meC]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair$$$V2.0',
  },
  {
    Description: '3. Inversion operation for D natural analog amino acid group',
    HELMString:
      'PEPTIDE1{D.[AspOMe].[D*]}|PEPTIDE2{[dD].[meD]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair$$$V2.0',
  },
  {
    Description: '4. Inversion operation for E natural analog amino acid group',
    HELMString:
      'PEPTIDE1{E.[D-gGlu].[dE]}|PEPTIDE2{[gGlu].[Gla].[meE]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
  },
  {
    Description: '5. Inversion operation for F natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAhPhe].F.[aMePhe].[Bip].[Bpa].[D-hPhe].[dF].[DPhe4C].[Phe-al]}|PEPTIDE2{[DAPhg3].[DPhe4F].[DPhe4u].[hPhe].[meF].[Phe_2F].[Phe_3F].[Phe_4F].[Phe_4I]}|PEPTIDE3{[Phe2Me].[Phe34d].[Phe3Cl].[Phe4Br].[Phe4Cl].[Phe4Me].[Phe4NH].[Phe4NO].[Phe-ol]}|PEPTIDE4{[PhLA].[Phe4SD].[PheaDH].[Phebbd].[PheNO2]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE1,PEPTIDE2,7:pair-7:pair|PEPTIDE1,PEPTIDE2,8:pair-8:pair|PEPTIDE1,PEPTIDE2,9:pair-9:pair|PEPTIDE2,PEPTIDE3,9:pair-9:pair|PEPTIDE2,PEPTIDE3,8:pair-8:pair|PEPTIDE2,PEPTIDE3,7:pair-7:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair$$$V2.0',
  },
  {
    Description: '6. Inversion operation for H natural analog amino acid group',
    HELMString:
      'PEPTIDE1{H.[dH].[DHis1B]}|PEPTIDE2{[Hhs].[His1Bn].[His1Me]}|PEPTIDE3{[His3Me].[meH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair$$$V2.0',
  },
  {
    Description: '7. Inversion operation for I natural analog amino acid group',
    HELMString:
      'PEPTIDE1{I.[aIle].[D-aIle]}|PEPTIDE2{[dI].[DxiIle].[meI]}|PEPTIDE3{[xiIle]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description: '8. Inversion operation for K natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DALys].K.[Aad].[D-Orn].[dK].[Dpm]}|PEPTIDE2{[Hyl5xi].[Lys_Ac].[LysBoc].[LysiPr].[Lys-al]}|PEPTIDE3{[LysMe3].[meK].[Orn].[Lys-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description: '9. Inversion operation for L natural analog amino acid group',
    HELMString:
      'PEPTIDE1{L.[Ar5c].[D-Nle]}|PEPTIDE2{[DALeu].[dL].[Leu-al]}|PEPTIDE3{[Nle].[meL].[Leu-ol]}|PEPTIDE4{[OLeu].[tLeu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '10. Inversion operation for M natural analog amino acid group',
    HELMString:
      'PEPTIDE1{M.[dM].[DMetSO]}|PEPTIDE2{[meM].[Met_O].[Met_O2]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
  },
  {
    Description:
      '11. Inversion operation for N natural analog amino acid group',
    HELMString:
      'PEPTIDE1{N.[dN]}|PEPTIDE2{[meN].[Asp-al]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '12. Inversion operation for O natural analog amino acid group',
    HELMString:
      'PEPTIDE1{O.[dO]}|PEPTIDE2{[meO]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '13. Inversion operation for P natural analog amino acid group',
    HELMString:
      'PEPTIDE1{P.[aHyp].[aMePro].[Aze].[D-aHyp].[D-Hyp]}|PEPTIDE2{[meP].[D-Thz].[dP].[Hyp].[Mhp].[DProol]}|PEPTIDE3{[xiHyp].[Thz].[Pro-al]}|PEPTIDE4{[Pro-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '14. Inversion operation for Q natural analog amino acid group',
    HELMString:
      'PEPTIDE1{Q.[dQ]}|PEPTIDE2{[meQ]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '15. Inversion operation for R natural analog amino acid group',
    HELMString:
      'PEPTIDE1{R.[Cit].[Arg-al]}|PEPTIDE2{[D-Cit].[D-hArg].[DhArgE]}|PEPTIDE3{[dR].[Har].[hArg]}|PEPTIDE4{[LhArgE].[meR]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '16. Inversion operation for S natural analog amino acid group',
    HELMString:
      'PEPTIDE1{S.[D-Dap].[Dap].[dS].[DSerBn].[DSertB]}|PEPTIDE2{[Hse].[meS].[Ser_Bn].[SerPO3].[SertBu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '17. Inversion operation for T natural analog amino acid group',
    HELMString:
      'PEPTIDE1{T.[aThr].[D-aThr]}|PEPTIDE2{[meT].[dT].[dThrol]}|PEPTIDE3{[ThrPO3].[xiThr].[Thr-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '18. Inversion operation for U natural analog amino acid group',
    HELMString:
      'PEPTIDE1{U.[dU]}|PEPTIDE2{[meU]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '19. Inversion operation for V natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[D-OVal].V.[D-Nva].[D-Pen].[DaMeAb]}|PEPTIDE2{[L-OVal].[dV].[Iva].[meV]}|PEPTIDE3{[Nva].[Pen].[Val3OH].[Val-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair$$$V2.0',
  },
  {
    Description:
      '20. Inversion operation for W natural analog amino acid group',
    HELMString:
      'PEPTIDE1{W.[DTrp2M].[DTrpFo]}|PEPTIDE2{[dW].[Kyn].[meW]}|PEPTIDE3{[Trp_Me].[Trp5OH].[TrpOme]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '21. Inversion operation for Y natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAnTyr].Y.[aMeTy3].[aMeTyr].[D-nTyr]}|PEPTIDE2{[TyrabD].[TyrPh4].[TyrPO3].[TyrSO3].[TyrtBu].[DTyr3O]}|PEPTIDE3{[DTyrEt].[DTyrMe].[dY].[meY].[nTyr].[Tyr_3I]}|PEPTIDE4{[Tyr_Bn].[Tyr_Me].[Tyr26d].[Tyr35d].[Tyr3NO].[Tyr3OH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE3,PEPTIDE4,6:pair-6:pair$$$V2.0',
  },
];

const aminoAcidsForNaturalAminoAcid: IHELMStringOrKetFile[] = [
  {
    Description:
      '1. Natural amino acid operation for A natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[L-OAla].A.[1Nal].[2Nal].[3Pal].[4Pal].[Abu].[bAla].[Ala-ol]}|PEPTIDE2{[DAlaol].[Cya].[D-1Nal].[D-2Nal].[D-2Pal].[D-2Thi].[D-3Pal].[D-Abu].[Ala-al]}|PEPTIDE3{[D-OAla].[dA].[Dha].[meA].[NMebAl].[Thi].[Tza].[Cha].[D-Cha]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE1,PEPTIDE2,7:pair-7:pair|PEPTIDE2,PEPTIDE3,7:pair-7:pair|PEPTIDE1,PEPTIDE2,8:pair-8:pair|PEPTIDE2,PEPTIDE3,8:pair-8:pair|PEPTIDE1,PEPTIDE2,9:pair-9:pair|PEPTIDE2,PEPTIDE3,9:pair-9:pair$$$V2.0',
  },
  {
    Description:
      '2. Natural amino acid operation for C natural analog amino acid group',
    HELMString:
      'PEPTIDE1{C.[Cys_Bn].[Cys_Me]}|PEPTIDE2{[DACys].[dC].[Edc]}|PEPTIDE3{[Hcy].[meC]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '3. Natural amino acid operation for D natural analog amino acid group',
    HELMString:
      'PEPTIDE1{D.[AspOMe].[D*]}|PEPTIDE2{[dD].[meD]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '4. Natural amino acid operation for E natural analog amino acid group',
    HELMString:
      'PEPTIDE1{E.[D-gGlu].[dE]}|PEPTIDE2{[gGlu].[Gla].[meE]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
  },
  {
    Description:
      '5. Natural amino acid operation for F natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAhPhe].F.[aMePhe].[Bip].[Bpa].[D-hPhe].[dF].[DPhe4C].[Phe-al]}|PEPTIDE2{[DAPhg3].[DPhe4F].[DPhe4u].[hPhe].[meF].[Phe_2F].[Phe_3F].[Phe_4F].[Phe_4I]}|PEPTIDE3{[Phe2Me].[Phe34d].[Phe3Cl].[Phe4Br].[Phe4Cl].[Phe4Me].[Phe4NH].[Phe4NO].[Phe-ol]}|PEPTIDE4{[PhLA].[Phe4SD].[PheaDH].[Phebbd].[PheNO2]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE1,PEPTIDE2,7:pair-7:pair|PEPTIDE1,PEPTIDE2,8:pair-8:pair|PEPTIDE1,PEPTIDE2,9:pair-9:pair|PEPTIDE2,PEPTIDE3,9:pair-9:pair|PEPTIDE2,PEPTIDE3,8:pair-8:pair|PEPTIDE2,PEPTIDE3,7:pair-7:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '6. Natural amino acid operation for G natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAGlyB].G.[Chg].[D-Chg].[D-Phg].[D-Pyr]}|PEPTIDE2{[DAGlyC].[DAGlyO].[Glyall].[GlycPr].[meG].[DPhgol]}|PEPTIDE3{[DAGlyP].[Phg].[Pyr].[Phg-ol]}|PEPTIDE4{[DAGlyT].[Gly-ol]}|PEPTIDE5{[DAPhg4].[Gly-al]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE4,PEPTIDE5,1:pair-1:pair|PEPTIDE4,PEPTIDE5,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '7. Natural amino acid operation for H natural analog amino acid group',
    HELMString:
      'PEPTIDE1{H.[dH].[DHis1B]}|PEPTIDE2{[Hhs].[His1Bn].[His1Me]}|PEPTIDE3{[His3Me].[meH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '8. Natural amino acid operation for I natural analog amino acid group',
    HELMString:
      'PEPTIDE1{I.[aIle].[D-aIle]}|PEPTIDE2{[dI].[DxiIle].[meI]}|PEPTIDE3{[xiIle]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '9. Natural amino acid operation for K natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DALys].K.[Aad].[D-Orn].[dK].[Dpm]}|PEPTIDE2{[Hyl5xi].[Lys_Ac].[LysBoc].[LysiPr].[Lys-al]}|PEPTIDE3{[LysMe3].[meK].[Orn].[Lys-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '10. Natural amino acid operation for L natural analog amino acid group',
    HELMString:
      'PEPTIDE1{L.[Ar5c].[D-Nle]}|PEPTIDE2{[DALeu].[dL].[Leu-al]}|PEPTIDE3{[Nle].[meL].[Leu-ol]}|PEPTIDE4{[OLeu].[tLeu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '11. Natural amino acid operation for M natural analog amino acid group',
    HELMString:
      'PEPTIDE1{M.[dM].[DMetSO]}|PEPTIDE2{[meM].[Met_O].[Met_O2]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair$$$V2.0',
  },
  {
    Description:
      '12. Natural amino acid operation for N natural analog amino acid group',
    HELMString:
      'PEPTIDE1{N.[dN]}|PEPTIDE2{[meN].[Asp-al]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '13. Natural amino acid operation for O natural analog amino acid group',
    HELMString:
      'PEPTIDE1{O.[dO]}|PEPTIDE2{[meO]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '14. Inversion operation for P natural analog amino acid group',
    HELMString:
      'PEPTIDE1{P.[aHyp].[aMePro].[Aze].[D-aHyp].[D-Hyp]}|PEPTIDE2{[meP].[D-Thz].[dP].[Hyp].[Mhp].[DProol]}|PEPTIDE3{[xiHyp].[Thz].[Pro-al]}|PEPTIDE4{[Pro-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE1,PEPTIDE2,6:pair-6:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '15. Natural amino acid operation for Q natural analog amino acid group',
    HELMString:
      'PEPTIDE1{Q.[dQ]}|PEPTIDE2{[meQ]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '16. Natural amino acid operation for R natural analog amino acid group',
    HELMString:
      'PEPTIDE1{R.[Cit].[Arg-al]}|PEPTIDE2{[D-Cit].[D-hArg].[DhArgE]}|PEPTIDE3{[dR].[Har].[hArg]}|PEPTIDE4{[LhArgE].[meR]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair$$$V2.0',
  },
  {
    Description:
      '17. Natural amino acid operation for S natural analog amino acid group',
    HELMString:
      'PEPTIDE1{S.[D-Dap].[Dap].[dS].[DSerBn].[DSertB]}|PEPTIDE2{[Hse].[meS].[Ser_Bn].[SerPO3].[SertBu]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair$$$V2.0',
  },
  {
    Description:
      '18. Natural amino acid operation for T natural analog amino acid group',
    HELMString:
      'PEPTIDE1{T.[aThr].[D-aThr]}|PEPTIDE2{[meT].[dT].[dThrol]}|PEPTIDE3{[ThrPO3].[xiThr].[Thr-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '19. Natural amino acid operation for U natural analog amino acid group',
    HELMString:
      'PEPTIDE1{U.[dU]}|PEPTIDE2{[meU]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '20. Natural amino acid operation for V natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[D-OVal].V.[D-Nva].[D-Pen].[DaMeAb]}|PEPTIDE2{[L-OVal].[dV].[Iva].[meV]}|PEPTIDE3{[Nva].[Pen].[Val3OH].[Val-ol]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair$$$V2.0',
  },
  {
    Description:
      '21. Natural amino acid operation for W natural analog amino acid group',
    HELMString:
      'PEPTIDE1{W.[DTrp2M].[DTrpFo]}|PEPTIDE2{[dW].[Kyn].[meW]}|PEPTIDE3{[Trp_Me].[Trp5OH].[TrpOme]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair$$$V2.0',
  },
  {
    Description:
      '22. Natural amino acid operation for Y natural analog amino acid group',
    HELMString:
      'PEPTIDE1{[DAnTyr].Y.[aMeTy3].[aMeTyr].[D-nTyr]}|PEPTIDE2{[TyrabD].[TyrPh4].[TyrPO3].[TyrSO3].[TyrtBu].[DTyr3O]}|PEPTIDE3{[DTyrEt].[DTyrMe].[dY].[meY].[nTyr].[Tyr_3I]}|PEPTIDE4{[Tyr_Bn].[Tyr_Me].[Tyr26d].[Tyr35d].[Tyr3NO].[Tyr3OH]}$PEPTIDE1,PEPTIDE2,1:pair-1:pair|PEPTIDE2,PEPTIDE3,1:pair-1:pair|PEPTIDE3,PEPTIDE4,1:pair-1:pair|PEPTIDE1,PEPTIDE2,2:pair-2:pair|PEPTIDE2,PEPTIDE3,2:pair-2:pair|PEPTIDE3,PEPTIDE4,2:pair-2:pair|PEPTIDE1,PEPTIDE2,3:pair-3:pair|PEPTIDE2,PEPTIDE3,3:pair-3:pair|PEPTIDE3,PEPTIDE4,3:pair-3:pair|PEPTIDE1,PEPTIDE2,4:pair-4:pair|PEPTIDE2,PEPTIDE3,4:pair-4:pair|PEPTIDE3,PEPTIDE4,4:pair-4:pair|PEPTIDE1,PEPTIDE2,5:pair-5:pair|PEPTIDE2,PEPTIDE3,5:pair-5:pair|PEPTIDE3,PEPTIDE4,5:pair-5:pair|PEPTIDE2,PEPTIDE3,6:pair-6:pair|PEPTIDE3,PEPTIDE4,6:pair-6:pair$$$V2.0',
  },
];

for (const aminoAcidForPhosphorylation of aminoAcidsForPhosphorylation) {
  test(`${aminoAcidForPhosphorylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: 1. Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - Phosphorylation
     * 2. Verify that after choosing a modification type from the menu, all amino acids for whom that modification exists replace
     *    the original monomer, and all bonds (both hydrogen and covalent) of that monomer preserved (Req.3)
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Phosphorylation
     *     4. Take screenshot to validate phosphorylation has been done and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForPhosphorylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Phosphorylation,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForPhosphorylation.shouldFail === true,
      `That test fails because of ${aminoAcidForPhosphorylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForSideChainAcetylation of aminoAcidsForSideChainAcetylation) {
  test(`${aminoAcidForSideChainAcetylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: 1. Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - Side chain acetylation
     * 2. Verify that after choosing a modification type from the menu, all amino acids for whom that modification exists replace
     *    the original monomer, and all bonds (both hydrogen and covalent) of that monomer preserved (Req.3)
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Side chain acetylation
     *     4. Take screenshot to validate Side chain acetylation has been done and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForSideChainAcetylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.SideChainAcetylation,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForSideChainAcetylation.shouldFail === true,
      `That test fails because of ${aminoAcidForSideChainAcetylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForCitrullination of aminoAcidsForCitrullination) {
  test(`${aminoAcidForCitrullination.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - Citrullination
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Citrullination
     *     4. Take screenshot to validate Citrullination has been done and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForCitrullination.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Citrullination,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForCitrullination.shouldFail === true,
      `That test fails because of ${aminoAcidForCitrullination.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForHydroxylation of aminoAcidsForHydroxylation) {
  test(`${aminoAcidForHydroxylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - Hydroxylation
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Hydroxylation
     *     4. Take screenshot to validate Hydroxylation has been done and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForHydroxylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Hydroxylation,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForHydroxylation.shouldFail === true,
      `That test fails because of ${aminoAcidForHydroxylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForNMethylation of aminoAcidsForNMethylation) {
  test(`${aminoAcidForNMethylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: 1. Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - N-methylation
     * 2. Verify that after choosing a modification type from the menu, all amino acids for whom that modification exists replace
     *    the original monomer, and all bonds (both hydrogen and covalent) of that monomer preserved (Req.3)
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click N-methylation
     *     4. Take screenshot to validate N-methylation has been done and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForNMethylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NMethylation,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForNMethylation.shouldFail === true,
      `That test fails because of ${aminoAcidForNMethylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForInversion of aminoAcidsForInversion) {
  test(`${aminoAcidForInversion.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: 1. Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - Inversion
     * 2. Verify that after choosing a modification type from the menu, all amino acids for whom that modification exists replace
     *    the original monomer, and all bonds (both hydrogen and covalent) of that monomer preserved (Req.3)
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Inversion
     *     4. Take screenshot to validate Inversion has been done
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForInversion.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Inversion,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForInversion.shouldFail === true,
      `That test fails because of ${aminoAcidForInversion.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForNaturalAminoAcid of aminoAcidsForNaturalAminoAcid) {
  test(`${aminoAcidForNaturalAminoAcid.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: 1. Assign every modification listed in Modification types to its matching amino‑acid and verify the alias on
     * the canvas updates accordingly ( Req.1) - Natural amino acid operation
     * 2. Verify that after choosing a modification type from the menu, all amino acids for whom that modification exists replace
     *    the original monomer, and all bonds (both hydrogen and covalent) of that monomer preserved (Req.3)
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Natural amino acid
     *     4. Take screenshot to validate Natural amino acid operation has been done
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForNaturalAminoAcid.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NaturalAminoAcid,
    ]);

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForNaturalAminoAcid.shouldFail === true,
      `That test fails because of ${aminoAcidForNaturalAminoAcid.issueNumber} issue.`,
    );
  });
}

test(`1. Check that amino acid modifications are not present in list if they are not applicable`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that amino acid modifications are not present in list if they are not applicable
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides that has no amino acid modifications applicable
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer
   *     4. Validate context menu doesn't contain Modify amino acids option
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).open();

  const modifyAminoAcidsOption = page
    .getByTestId(MonomerOption.ModifyAminoAcids)
    .first();
  await expect(modifyAminoAcidsOption).toHaveCount(0);
});

test('2. Check that phosphorylation modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that phosphorylation modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for phosphorylation)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on Phosphorylation
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Phosphorylation,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('3. Check that Side Chain Acetylation modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that Side Chain Acetylation modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for Side Chain Acetylation)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on Side Chain Acetylation
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.SideChainAcetylation,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('4. Check that Citrullination modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that Citrullination modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for Citrullination)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on Citrullination
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Citrullination,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('5. Check that Hydroxylation modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that Hydroxylation modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for Hydroxylation)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on Hydroxylation
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Hydroxylation,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('6. Check that N-methylation modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that N-methylation modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for N-methylation)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on N-methylation
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.NMethylation,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('7. Check that Inversion modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that Inversion modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for Inversion)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on Inversion
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Inversion,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('8. Check that Natural amino acid modifies only eligable monomers', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check that Natural amino acid modifies only eligable monomers
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for Natural amino acid)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click on Natural amino acid
   *     4. Take screenshot to validate that only one (eligable) peptide was modified and others remain unchanged
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.NaturalAminoAcid,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test('9. Check that Right-clicking on a selection that includes an amino-acid (in all modes), result in a drop-down menu with a new option Modify....', async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: 1. Check that Right-clicking on a selection that includes an amino-acid (in all modes),
   * result in a drop-down menu with a new option "Modify...". Hovering over/clicking on the "Modify..."
   * option give a list of modifications (Req.2)
   * 2. Check that Natural amino acid option first one in the drop-down if it is available. All other
   *    modifications ordered alphabetically. (Req 2.2)
   * 3. Select a set containing an amino‑acid that does have a given modification and one that does
   *    not → open Modify… → confirm the modification is listed (availability logic satisfied) (Req.2.1)
   *
   * Case:
   *     1. Load KET file with all types of monomers and peptides (including peptide eligable for Natural amino acid)
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for random monomer and click Modify...
   *     4. Take screenshot to validate that full list of modifications present in contex menu
   */
  test.setTimeout(15000);

  await openFileAndAddToCanvasAsNewProjectMacro(
    page,
    'KET/Modifying-Amino-Acids/All types of monomers on the canvas and all amino acid modifications.ket',
  );

  await selectAllStructuresOnCanvas(page);

  const randomPeptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, randomPeptide).hover(MonomerOption.ModifyAminoAcids);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

test(`10. Verify that Phosphorylation menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for Phosphorylation
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that Phosphorylation menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{S}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.Phosphorylation)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`11. Verify that Side chain acetylation menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for Side chain acetylation
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that Phosphorylation menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{K}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.SideChainAcetylation)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`12. Verify that Citrullination menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for Citrullination
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that Citrullination menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{R}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.Citrullination)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`13. Verify that Hydroxylation menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for Hydroxylation
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that Hydroxylation menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{P}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.Hydroxylation)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`14. Verify that N-methylation menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for N-methylation
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that N-methylation menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.NMethylation)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`15. Verify that Inversion menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for Natural amino acid
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that Natural amino acid menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.Inversion)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`16. Verify that Natural amino acid menu options is available for single selected monomer`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Right‑click a single amino‑acid (all modes) → confirm a Modify… menu item appears,
   *              then hover it and check a submenu of modification types is displayed (Req.2)
   *
   * Case:
   *     1. Load HELM string with monomer eligable for Natural amino acid
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that Natural amino acid menu options is available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{[1Nal]}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.NaturalAminoAcid)
    .first();
  await expect(modifyAminoAcidsOption).toBeVisible();
});

test(`17. Verify that N-methylation options is NOT available for selected monomer if R1 occupied`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Select an amino‑acid whose R1 is occupied and whose modification lacks R1 → open Modify… → confirm
   *              that modification is not listed (Req. 2.1)
   *
   * Case:
   *     1. Load HELM string with sequence with monomer (P) eligable for N-methylation but with R1 occupied
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and hover mouse over Modify amino acids option
   *     4. Validate that N-methylation menu options is NOT available
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{A.P.A}$$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).hover(MonomerOption.ModifyAminoAcids);

  const modifyAminoAcidsOption = page
    .getByTestId(ModifyAminoAcidsOption.NMethylation)
    .first();
  await expect(modifyAminoAcidsOption).toHaveCount(0);
});

test(`18. Check if the original monomer had a side-chain connection, but the replacement monomer does not, a warning message appear after the modification type is chosen`, async () => {
  /*
   * Test task: https://github.com/epam/ketcher/issues/7265
   * Description: Check if the original monomer had a side-chain connection, but the replacement monomer does not, a warning message
   *              appear after the modification type is chosen: "Some side chain connections will be deleted during replacement.
   *              Do you want to proceed?" with the options of "Cancel" (default) and "Yes" (Req. 3.1)
   *
   * Case:
   *     1. Load HELM string with sequence with monomers (R) eligable for Citrullination but with R3 occupied
   *     2. Select all monomer on the canva (using Control+A)
   *     3. Call context menu for monomer and click Citrullination in Modify amino acids option submenu
   *     4. Take screenshot to validate warning message appearence
   *     5. Click Yes
   *     6. Take screenshot to validate removed bonds
   */
  test.setTimeout(15000);

  await pasteFromClipboardAndAddToMacromoleculesCanvas(
    page,
    MacroFileType.HELM,
    'PEPTIDE1{R.R.R}|PEPTIDE2{A}|PEPTIDE3{C}|PEPTIDE4{D}$PEPTIDE1,PEPTIDE2,1:R3-1:R1|PEPTIDE1,PEPTIDE3,2:R3-1:R2|PEPTIDE1,PEPTIDE4,3:R3-1:R3$$$V2.0',
  );

  await selectAllStructuresOnCanvas(page);

  const peptide = getMonomerLocator(page, {
    monomerType: MonomerType.Peptide,
  }).first();

  await ContextMenu(page, peptide).click([
    MonomerOption.ModifyAminoAcids,
    ModifyAminoAcidsOption.Citrullination,
  ]);

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });

  await page.getByTitle('Yes').click();

  await takeEditorScreenshot(page, {
    hideMacromoleculeEditorScrollBars: true,
    hideMonomerPreview: true,
  });
});

for (const aminoAcidForPhosphorylation of aminoAcidsForPhosphorylation) {
  test(`Saving to KET: ${aminoAcidForPhosphorylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Phosphorylation
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForPhosphorylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Phosphorylation,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForPhosphorylation.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForPhosphorylation.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForPhosphorylation.shouldFail === true,
      `That test fails because of ${aminoAcidForPhosphorylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForSideChainAcetylation of aminoAcidsForSideChainAcetylation) {
  test(`Saving to KET: ${aminoAcidForSideChainAcetylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Side chain acetylation
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForSideChainAcetylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.SideChainAcetylation,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForSideChainAcetylation.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForSideChainAcetylation.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForSideChainAcetylation.shouldFail === true,
      `That test fails because of ${aminoAcidForSideChainAcetylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForCitrullination of aminoAcidsForCitrullination) {
  test(`Saving to KET: ${aminoAcidForCitrullination.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Citrullination
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForCitrullination.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Citrullination,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForCitrullination.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForCitrullination.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForCitrullination.shouldFail === true,
      `That test fails because of ${aminoAcidForCitrullination.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForHydroxylation of aminoAcidsForHydroxylation) {
  test(`Saving to KET: ${aminoAcidForHydroxylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Hydroxylation
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForHydroxylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Hydroxylation,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForHydroxylation.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForHydroxylation.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForHydroxylation.shouldFail === true,
      `That test fails because of ${aminoAcidForHydroxylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForNMethylation of aminoAcidsForNMethylation) {
  test(`Saving to KET: ${aminoAcidForNMethylation.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click N-methylation
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForNMethylation.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NMethylation,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForNMethylation.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForNMethylation.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForNMethylation.shouldFail === true,
      `That test fails because of ${aminoAcidForNMethylation.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForInversion of aminoAcidsForInversion) {
  test(`Saving to KET: ${aminoAcidForInversion.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Inversion
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForInversion.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.Inversion,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForInversion.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForInversion.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForInversion.shouldFail === true,
      `That test fails because of ${aminoAcidForInversion.issueNumber} issue.`,
    );
  });
}

for (const aminoAcidForNaturalAminoAcid of aminoAcidsForNaturalAminoAcid) {
  test(`Saving to KET: ${aminoAcidForNaturalAminoAcid.Description}`, async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/7265
     * Description: Verify that structures with modified amino acids are correctly saved to KET
     *
     * Case:
     *     1. Load HELM string with all peptides from same group
     *     2. Select all monomer on the canva (using Control+A)
     *     3. Call context menu for random monomer and click Natural amino acid
     *     4. Validate export to KET file
     *     5. Load resulted KET as New Project
     *     6. Take screenshot to validate modified peptides and all bonds remain in place
     */
    test.setTimeout(15000);

    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      aminoAcidForNaturalAminoAcid.HELMString || '',
    );

    await selectAllStructuresOnCanvas(page);

    const randomPeptide = getMonomerLocator(page, {
      monomerType: MonomerType.Peptide,
    }).first();

    await ContextMenu(page, randomPeptide).click([
      MonomerOption.ModifyAminoAcids,
      ModifyAminoAcidsOption.NaturalAminoAcid,
    ]);

    await verifyFileExport(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForNaturalAminoAcid.Description}.ket`,
      FileType.KET,
    );

    await openFileAndAddToCanvasAsNewProjectMacro(
      page,
      `KET/Modifying-Amino-Acids/${aminoAcidForNaturalAminoAcid.Description}.ket`,
    );

    await takeEditorScreenshot(page, {
      hideMacromoleculeEditorScrollBars: true,
      hideMonomerPreview: true,
    });

    // Test should be skipped if related bug exists
    test.fixme(
      aminoAcidForNaturalAminoAcid.shouldFail === true,
      `That test fails because of ${aminoAcidForNaturalAminoAcid.issueNumber} issue.`,
    );
  });
}
