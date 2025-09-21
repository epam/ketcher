/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable no-magic-numbers */
import { test } from '@fixtures';
import { Page } from '@playwright/test';
import { CommonTopLeftToolbar } from '@tests/pages/common/CommonTopLeftToolbar';
import { SaveStructureDialog } from '@tests/pages/common/SaveStructureDialog';
import { MacromoleculesFileFormatType } from '@tests/pages/constants/fileFormats/macroFileFormats';
import {
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  takeEditorScreenshot,
} from '@utils';
import { verifyHELMExport } from '@utils/files/receiveFileComparisonData';

let page: Page;

test.describe('Support aliases from HELM', () => {
  test.beforeAll(async ({ initFlexCanvas }) => {
    page = await initFlexCanvas();
  });
  test.afterAll(async ({ closePage }) => {
    await closePage();
  });

  test('Case 1: Check import/export aliases from HELM (Peptides)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/6785
     * Description: Check that molecules with HELM aliases can be imported and exported correctly
     * Scenario:
     * 1. Go to Macro mode
     * 2. Paste the HELM notation with aliases into the editor
     * 3. Check that the structure is displayed correctly
     * 4. Export the structure in HELM format
     * 5. Check that the exported HELM notation matches the original notation
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'PEPTIDE1{[ac]}|PEPTIDE2{[Phe_3Cl]}|PEPTIDE3{[Phe_4Cl]}|PEPTIDE4{[Phe_4NH2]}|PEPTIDE5{[Ser_tBu]}|PEPTIDE6{[Lys_Boc]}|PEPTIDE7{[D-Ser_tBu]}|PEPTIDE8{[Lys_Me3]}|PEPTIDE9{[Phe_4Me]}|PEPTIDE10{[Tyr_tBu]}|PEPTIDE11{[Ala_tBu]}|PEPTIDE12{[D-Phe_4Cl]}|PEPTIDE13{[D-Ser_Bn]}|PEPTIDE14{[MsO]}|PEPTIDE15{[Oic_3aS-7aS]}|PEPTIDE16{[D-aMeAbu]}|PEPTIDE17{[Cbz]}|PEPTIDE18{[NHEt]}|PEPTIDE19{[OEt]}|PEPTIDE20{[OtBu]}|PEPTIDE21{[Tos]}|PEPTIDE22{[fmoc]}|PEPTIDE23{[Bua]}|PEPTIDE24{[deamino-Cys]}|PEPTIDE25{[deamino-Dab]}|PEPTIDE26{[deamino-Gly_CN]}|PEPTIDE27{[deamino-Gly_cPent]}|PEPTIDE28{[deamino-Gly_OH]}|PEPTIDE29{[deamino-Gly_thien2yl]}|PEPTIDE30{[D-Trp_For]}|PEPTIDE31{[deamino-Ncy]}|PEPTIDE32{[deamino-Phe]}|PEPTIDE33{[deamino-Phg_35diMe]}|PEPTIDE34{[deamino-Leu]}|PEPTIDE35{[Bz]}|PEPTIDE36{[D-Tyr_Et]}|PEPTIDE37{[Asp_OMe]}|PEPTIDE38{[NMe23Abz]}|PEPTIDE39{[Phe_ab-dehydro]}|PEPTIDE40{[Sta_3xi4xi]}|PEPTIDE41{[Tyr_ab-dehydroMe]}|PEPTIDE42{[Cys_SEt]}|PEPTIDE43{[Pro_4Me3OH]}|PEPTIDE44{[D-Ala-ol]}|PEPTIDE45{[D-Phg-ol]}|PEPTIDE46{[D-Thr-ol]}|PEPTIDE47{[NHMe]}|PEPTIDE48{[Phe_2Me]}|PEPTIDE49{[Phe_34diCl]}|PEPTIDE50{[Phe_4Br]}|PEPTIDE51{[Phe_4Sdihydroorotamido]}|PEPTIDE52{[Pyl]}|PEPTIDE53{[Ser_PO3H2]}|PEPTIDE54{[Thr_PO3H2]}|PEPTIDE55{[Tyr_26diMe]}|PEPTIDE56{[Tyr_3NO2]}|PEPTIDE57{[Tyr_Ph4OH]}|PEPTIDE58{[Tyr_SO3H]}|PEPTIDE59{[Val_3OH]}|PEPTIDE60{[NMe2Abz]}|PEPTIDE61{[NMebAla]}|PEPTIDE62{[aMeTyr_3OH]}|PEPTIDE63{[hHis]}|PEPTIDE64{[His_1Me]}|PEPTIDE65{[Gly_allyl]}|PEPTIDE66{[Gly_cPr]}|PEPTIDE67{[Asp_Ph2NH2]}|PEPTIDE68{[D-Bmt_E]}|PEPTIDE69{[D-Phe_4F]}|PEPTIDE70{[D-Trp_2Me]}|PEPTIDE71{[D-Tyr_3OH]}|PEPTIDE72{[D-Tyr_Me]}|PEPTIDE73{[D-xiIle]}|PEPTIDE74{[Lys_iPr]}|PEPTIDE75{[Ph]}|PEPTIDE76{[Boc]}|PEPTIDE77{[deamino-Chg]}|PEPTIDE78{[deamino-Dip]}|PEPTIDE79{[deamino-Gly_tBu]}|PEPTIDE80{[deamino-hPhe]}|PEPTIDE81{[deamino-nTyr_Me]}|PEPTIDE82{[deamino-Phg_4Cl]}|PEPTIDE83{[deamino-Lys]}|PEPTIDE84{[NMe24Abz]}|PEPTIDE85{[Phe_ab-dehydro_3NO2]}|PEPTIDE86{[Sta_3S4S]}|PEPTIDE87{[seC]}|PEPTIDE88{[D-Pro-ol]}|PEPTIDE89{[L-hArg_2Et]}|PEPTIDE90{[Oic_3aR-7aS]}|PEPTIDE91{[Oic_3axi-7axi]}|PEPTIDE92{[Phe_4NO2]}|PEPTIDE93{[Phe_bbdiMe]}|PEPTIDE94{[Trp_5OH]}|PEPTIDE95{[Trp_Ome]}|PEPTIDE96{[Tyr_35diI]}|PEPTIDE97{[Tyr_3OH]}|PEPTIDE98{[Tyr_PO3H2]}|PEPTIDE99{[NMe4Abz]}|PEPTIDE100{[His_1Bn]}|PEPTIDE101{[His_3Me]}|PEPTIDE102{[Hyl_5xi]}|PEPTIDE103{[Abu_23dehydro]}|PEPTIDE104{[D-hArg_Et2]}|PEPTIDE105{[D-Met_S-O]}|PEPTIDE106{[D-His_1Bn]}|PEPTIDE107{[am]}|PEPTIDE108{[D-Phe_4ureido]}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyHELMExport(
      page,
      `PEPTIDE1{[ac]}|PEPTIDE2{[Phe_3Cl]}|PEPTIDE3{[Phe_4Cl]}|PEPTIDE4{[Phe_4NH2]}|PEPTIDE5{[Ser_tBu]}|PEPTIDE6{[Lys_Boc]}|PEPTIDE7{[D-Ser_tBu]}|PEPTIDE8{[Lys_Me3]}|PEPTIDE9{[Phe_4Me]}|PEPTIDE10{[Tyr_tBu]}|PEPTIDE11{[Ala_tBu]}|PEPTIDE12{[D-Phe_4Cl]}|PEPTIDE13{[D-Ser_Bn]}|PEPTIDE14{[MsO]}|PEPTIDE15{[Oic_3aS-7aS]}|PEPTIDE16{[D-aMeAbu]}|PEPTIDE17{[Cbz]}|PEPTIDE18{[NHEt]}|PEPTIDE19{[OEt]}|PEPTIDE20{[OtBu]}|PEPTIDE21{[Tos]}|PEPTIDE22{[fmoc]}|PEPTIDE23{[Bua]}|PEPTIDE24{[deamino-Cys]}|PEPTIDE25{[deamino-Dab]}|PEPTIDE26{[deamino-Gly_CN]}|PEPTIDE27{[deamino-Gly_cPent]}|PEPTIDE28{[deamino-Gly_OH]}|PEPTIDE29{[deamino-Gly_thien2yl]}|PEPTIDE30{[D-Trp_For]}|PEPTIDE31{[deamino-Ncy]}|PEPTIDE32{[deamino-Phe]}|PEPTIDE33{[deamino-Phg_35diMe]}|PEPTIDE34{[deamino-Leu]}|PEPTIDE35{[Bz]}|PEPTIDE36{[D-Tyr_Et]}|PEPTIDE37{[Asp_OMe]}|PEPTIDE38{[NMe23Abz]}|PEPTIDE39{[Phe_ab-dehydro]}|PEPTIDE40{[Sta_3xi4xi]}|PEPTIDE41{[Tyr_ab-dehydroMe]}|PEPTIDE42{[Cys_SEt]}|PEPTIDE43{[Pro_4Me3OH]}|PEPTIDE44{[D-Ala-ol]}|PEPTIDE45{[D-Phg-ol]}|PEPTIDE46{[D-Thr-ol]}|PEPTIDE47{[NHMe]}|PEPTIDE48{[Phe_2Me]}|PEPTIDE49{[Phe_34diCl]}|PEPTIDE50{[Phe_4Br]}|PEPTIDE51{[Phe_4Sdihydroorotamido]}|PEPTIDE52{[Pyl]}|PEPTIDE53{[Ser_PO3H2]}|PEPTIDE54{[Thr_PO3H2]}|PEPTIDE55{[Tyr_26diMe]}|PEPTIDE56{[Tyr_3NO2]}|PEPTIDE57{[Tyr_Ph4OH]}|PEPTIDE58{[Tyr_SO3H]}|PEPTIDE59{[Val_3OH]}|PEPTIDE60{[NMe2Abz]}|PEPTIDE61{[NMebAla]}|PEPTIDE62{[aMeTyr_3OH]}|PEPTIDE63{[hHis]}|PEPTIDE64{[His_1Me]}|PEPTIDE65{[Gly_allyl]}|PEPTIDE66{[Gly_cPr]}|PEPTIDE67{[Asp_Ph2NH2]}|PEPTIDE68{[D-Bmt_E]}|PEPTIDE69{[D-Phe_4F]}|PEPTIDE70{[D-Trp_2Me]}|PEPTIDE71{[D-Tyr_3OH]}|PEPTIDE72{[D-Tyr_Me]}|PEPTIDE73{[D-xiIle]}|PEPTIDE74{[Lys_iPr]}|PEPTIDE75{[Ph]}|PEPTIDE76{[Boc]}|PEPTIDE77{[deamino-Chg]}|PEPTIDE78{[deamino-Dip]}|PEPTIDE79{[deamino-Gly_tBu]}|PEPTIDE80{[deamino-hPhe]}|PEPTIDE81{[deamino-nTyr_Me]}|PEPTIDE82{[deamino-Phg_4Cl]}|PEPTIDE83{[deamino-Lys]}|PEPTIDE84{[NMe24Abz]}|PEPTIDE85{[Phe_ab-dehydro_3NO2]}|PEPTIDE86{[Sta_3S4S]}|PEPTIDE87{[seC]}|PEPTIDE88{[D-Pro-ol]}|PEPTIDE89{[L-hArg_2Et]}|PEPTIDE90{[Oic_3aR-7aS]}|PEPTIDE91{[Oic_3axi-7axi]}|PEPTIDE92{[Phe_4NO2]}|PEPTIDE93{[Phe_bbdiMe]}|PEPTIDE94{[Trp_5OH]}|PEPTIDE95{[Trp_Ome]}|PEPTIDE96{[Tyr_35diI]}|PEPTIDE97{[Tyr_3OH]}|PEPTIDE98{[Tyr_PO3H2]}|PEPTIDE99{[NMe4Abz]}|PEPTIDE100{[His_1Bn]}|PEPTIDE101{[His_3Me]}|PEPTIDE102{[Hyl_5xi]}|PEPTIDE103{[Abu_23dehydro]}|PEPTIDE104{[D-hArg_Et2]}|PEPTIDE105{[D-Met_S-O]}|PEPTIDE106{[D-His_1Bn]}|PEPTIDE107{[am]}|PEPTIDE108{[D-Phe_4ureido]}$$$$V2.0`,
    );
  });

  test('Case 2: Check import/export aliases from HELM (Bases)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/6785
     * Description: Check that molecules with HELM aliases can be imported and exported correctly
     * Scenario:
     * 1. Go to Macro mode
     * 2. Paste the HELM notation with aliases into the editor
     * 3. Check that the structure is displayed correctly
     * 4. Export the structure in HELM format
     * 5. Check that the exported HELM notation matches the original notation
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(m2nprn2A).r(c3allyl3G).r(c3allyl3G).r(oC64m5C).r(cp5m42C).r(cp5C).r(m5C).r(pry5C).r(thiaz5C).r(c7io7n2A).r(c7pry7n2A).r(c7pry7A).r(n2br7c7z8A).r(tCnitro).r(allyl9G).r(nC6ncee5C).r(gclampC).r(ggclampC).r(moprn2A).r(2imen2A).r(4imen2G).r(bn6A).r(m62A).r(m6A).r(imprn2A).r(cpm6A).r(phoxC).r(tclampA).r(mo4bn3T).r(brvinyl5U).r(allyl5U).r(cp5U).r(DBCOnC6ncee5U).r(ethy5U).r(fl5U).r(io5U).r(pry5U).r(thiaz5U).r(thien5z6U).r(tflm5U).r(tp5U).r(vinyl5U).r(z6pry5U).r(h456U_R).r(nC6ncee5U).r(Hyp).r(nobn6p).r(s6purine)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyHELMExport(
      page,
      `RNA1{r([m2nprn2A]).r([c3allyl3G]).r([c3allyl3G]).r([oC64m5C]).r([cp5m42C]).r([cp5C]).r([m5C]).r([pry5C]).r([thiaz5C]).r([c7io7n2A]).r([c7pry7n2A]).r([c7pry7A]).r([n2br7c7z8A]).r([tCnitro]).r([allyl9G]).r([nC6ncee5C]).r([gclampC]).r([ggclampC]).r([moprn2A]).r([2imen2A]).r([4imen2G]).r([bn6A]).r([m62A]).r([m6A]).r([imprn2A]).r([cpm6A]).r([phoxC]).r([tclampA]).r([mo4bn3T]).r([brvinyl5U]).r([allyl5U]).r([cp5U]).r([DBCOnC6ncee5U]).r([ethy5U]).r([fl5U]).r([io5U]).r([pry5U]).r([thiaz5U]).r([thien5z6U]).r([tflm5U]).r([tp5U]).r([vinyl5U]).r([z6pry5U]).r([h456U_R]).r([nC6ncee5U]).r([Hyp]).r([nobn6pur]).r([s6purine])}$$$$V2.0`,
    );
  });

  test('Case 3: Check import/export aliases from HELM (Phosphates)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/6785
     * Description: Check that molecules with HELM aliases can be imported and exported correctly
     * Scenario:
     * 1. Go to Macro mode
     * 2. Paste the HELM notation with aliases into the editor
     * 3. Check that the structure is displayed correctly
     * 4. Export the structure in HELM format
     * 5. Check that the exported HELM notation matches the original notation
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{r(A)bp.r(A)p.r(A)sp}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyHELMExport(page, `RNA1{r(A)[bp].r(A)p.r(A)[sp]}$$$$V2.0`);
  });

  test('Case 4: Check import/export aliases from HELM (Sugars)', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/6785
     * Description: Check that molecules with HELM aliases can be imported and exported correctly
     * Scenario:
     * 1. Go to Macro mode
     * 2. Paste the HELM notation with aliases into the editor
     * 3. Check that the structure is displayed correctly
     * 4. Export the structure in HELM format
     * 5. Check that the exported HELM notation matches the original notation
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{m(A).[3SS6].[fl2r](A).fl5pr2r(A).menoe2r(A).fl3pr2r(A).GalNAc3C62r(A).oheom2r(A).pyren1ylm2r(A).allyl2r(A).moe(A).prpargyl2r(A).e2noe2r(A).iprmnoe2r(A).guane2r(A).m2npr2r(A).m2nenc2r(A).ctfl3moe(A).n3r(A).me3fl2r(A).m3ALlna(A).moe3ana(A).25moe3r(A).s4r(A).5R6Rm5cEt(A).5R6Sm5cEt(A).5S6Rm5cEt(A).5S6Sm5cEt(A).Rm5ALlna(A).Sm5fl2r(A).Sm5ALlna(A).Svinyl5lna(A).Sm6fhna(A).Sm6ALlna(A).Diprglyol2r(A).Liprglyol2r(A).Rgna(A).Rm5fl2r(A).Rflclna(A).Rso2lna(A).RSpabCNA(A).Sgna(A).Sso2lna(A).SRpabCNA(A).Smn2cet(A).Rmn2cet(A).hna(A).afl2Nmc(A).Dlyspna(A).Llyspna(A).r(A).25r(A).tna(A).una(A).ALlna(A).ALmeclna(A).ALtrina1(A).ALtrina2(A)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await verifyHELMExport(
      page,
      `RNA1{m(A).[36SS].[fl2r](A).[fl5pr2r](A).[menoe2r](A).[fl3pr2r](A).[GalNAc3C62r](A).[oheom2r](A).[pyren1ylm2r](A).[allyl2r](A).[moe](A).[prpargyl2r](A).[e2noe2r](A).[iprmnoe2r](A).[guane2r](A).[m2npr2r](A).[m2nenc2r](A).[ctfl3moe](A).[n3r](A).[me3fl2r](A).[m3ALlna](A).[moe3ana](A).[25moe3r](A).[s4r](A).[5R6Rm5cEt](A).[5R6Sm5cEt](A).[5S6Rm5cEt](A).[5S6Sm5cEt](A).[Rm5ALlna](A).[Sm5fl2r](A).[Sm5ALlna](A).[Svinyl5lna](A).[Sm6fhna](A).[Sm6ALlna](A).[Diprglyol2r](A).[Liprglyol2r](A).[Rgna](A).[Rm5fl2r](A).[Rflclna](A).[Rso2lna](A).[RSpabCNA](A).[Sgna](A).[Sso2lna](A).[SRpabCNA](A).[Smn2cet](A).[Rmn2cet](A).[hna](A).[afl2Nmc](A).[Dlyspna](A).[Llyspna](A).r(A).[25r](A).[tna](A).[una](A).[ALlna](A).[ALmeclna](A).[ALtrina1](A).[ALtrina2](A)}$$$$V2.0`,
    );
  });

  test('Case 5: Check that in case of export to HELM of a monomer whose HELM Alias property is absent, an warning message appear', async () => {
    /*
     * Version 3.7
     * Test case: https://github.com/epam/ketcher/issues/6785
     * Description: In case of export to HELM of a monomer whose HELM Alias property is absent, an warning message (the black box at the bottom of the screen)
     * appear with the text: "Some of the monomers do not have aliases in the HELM core library - they are exported using Ketcher aliases."
     * Scenario:
     * 1. Go to Macro mode
     * 2. Paste the HELM notation with aliases into the editor
     * 3. Check that the structure is displayed correctly
     * 4. Export the structure in HELM format
     * 5. Check warning message
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{3A6}$$$$V2.0',
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
    await CommonTopLeftToolbar(page).saveFile();
    await SaveStructureDialog(page).chooseFileFormat(
      MacromoleculesFileFormatType.HELM,
    );
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  });
});
