/* eslint-disable max-len */
import { Page, test } from '@playwright/test';
import {
  takeEditorScreenshot,
  waitForPageInit,
  MacroFileType,
  pasteFromClipboardAndAddToMacromoleculesCanvas,
  selectSnakeLayoutModeTool,
  openFileAndAddToCanvasAsNewProjectMacro,
  selectFlexLayoutModeTool,
  selectSequenceLayoutModeTool,
  chooseFileFormat,
  pressButton,
} from '@utils';
import {
  selectClearCanvasTool,
  selectSaveTool,
  turnOnMacromoleculesEditor,
  turnOnMicromoleculesEditor,
} from '@tests/pages/common/TopLeftToolbar';
import {
  FileType,
  verifyFileExport,
} from '@utils/files/receiveFileComparisonData';

let page: Page;

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  page = await context.newPage();

  await waitForPageInit(page);
  await turnOnMacromoleculesEditor(page);
  await selectSnakeLayoutModeTool(page);
});

test.afterEach(async () => {
  await selectClearCanvasTool(page);
  await turnOnMacromoleculesEditor(page);
});

test.afterAll(async ({ browser }) => {
  await Promise.all(browser.contexts().map((context) => context.close()));
});

test(
  '1. Check that every not modified amino acid, sugar, base and phosphate on canvas (flex and snake modes) are not marked as modified',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
     * Test task: https://github.com/epam/ketcher/issues/6206
     * Description: Check that every not modified amino acid, sugar, base and phosphate on canvas (flex and snake modes) are not marked as modified
     * Case:
     *       1. Open HELM with all not modified monomers at snake mode
     *       2. Take a screenshot to verify that not modified monomers are not marked
     * IMPORTANT: Result of execution is incorrect because of https://github.com/epam/ketcher/issues/6053 issue.
     * Screenshot should be updated after fix.
     */
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      'RNA1{R(A)P.R(C)P.R(G)P.R(T)P.R(U)P}|PEPTIDE1{A.C.D.[D*].E.F.G}|PEPTIDE2{H.K.L.M.N.O.P}|' +
        'PEPTIDE3{Q.R.S.T.U.V.W}|PEPTIDE4{Y.(A,C,D,E,F,G,H,I,K,L,M,N,O,P,Q,R,S,T,U,V,W,Y).(D,N).(L,I).(E,Q)}$$$$V2.0',
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
  },
);

const modifiedMonomers: string[] = [
  'RNA1{[12ddR][bnn].[25d3r]([4ime6A])[bP].[25mo3r]([az8A])[cm].[25moe3]([baA])[cmp].[25R]([br8A])[co].' +
    '[3A6]([c3A])[en].[3FAM][eop].[3SS6][fl2me].[4sR]([c7io7A])[gly].[5A6]([c7io7n])[hn].[ana]([meA])[Ssp].' +
    '[am6][sP-].[Am2d]([m2A])[sP].[am12][Smp].[ALtri2]([io2A])[s2p].[ALtri1]([imprn2])[Rsp].' +
    '[ALmecl]([impr6n])[Rmp].[allyl2]([fl2A])[prn].[aFR]([eaA])[P-].[afl2Nm]([e6A])[oxy].' +
    '[afhna]([dabA])[nen].[Ae2d]([daA])[msp].[acn4d]([cyp6A])[mp].[5S6Sm5]([cyh6A])[moen].' +
    '[5S6Rm5]([cpmA])[mn].[5R6Sm5]([clA])[mepo2].[5R6Rm5]([cl8A])[me].[5formD]([cl2cyp])[m2np]}' +
    '|RNA2{[5FAM]}$RNA2,RNA1,1:R2-1:R1$$$V2.0',

  'RNA1{[aoe2r]([mo2A])}|RNA2{[aR]([moprn2])}|RNA3{[bcdna]([ms2A])}|RNA4{[Bcm2r]([n2A])}|' +
    'RNA5{[Bcm3d]([n8A])}|RNA6{[Bcm3r]([nC6n8A])}|RNA7{[Bcoh4d]([nen2A])}|RNA8{[bn2r]([o8A])}|' +
    'RNA9{[bnanc]([phen2A])}|RNA10{[bnancm]([z8A])}|RNA11{[bnoe2r]([5meC])}|RNA12{[bu2r]([ac4C])}|' +
    'RNA13{[c4d]([br5C])}|RNA14{[c4m]([cdaC])}|RNA15{[C52r]([cl5C])}|RNA16{[C92r]([cpC])}|' +
    'RNA17{[cena]([ethy5C])}|RNA18{[cet]([fl3mC])}|RNA19{[ciPr]([fl5C])}|RNA20{[clhna]([form5C])}|' +
    'RNA21{[d5m]([gclamp])}|RNA22{[d5moe]([ggclam])}|RNA23{[dhp]([hm5C])}|RNA24{[Dlyspn]([m4C])}|' +
    'RNA25{[dmac]([nC65C])}|RNA26{[dmaeac]([nC6n5C])}|RNA27{[dmaeoe]([npry5C])}|RNA28{[dmaoe]([oC64m5])}|' +
    'RNA29{[dR]([oh4C])}|RNA30{[e2noe2]([oh5C])}|RNA31{[e2r]([prpC])}|RNA32{[eom2r]([s2C])}|' +
    'RNA33{[eR]([tCnitr])}|RNA34{[fcena]([tCo])}|RNA35{[fhna]([thiz5C])}|RNA36{[fl2Nmc]([z5C])}|' +
    'RNA37{[fl3e2r]([4imen2])}|RNA38{[fl3pr2]([allyl9])}|RNA39{[fl5pr2]([br8G])}|RNA40{[fle2r]([c3ally])}|' +
    'RNA41{[fleana]([c3G])}|RNA42{[FMOE]([c7G])}|RNA43{[fR]([c7io7G])}|RNA44{[GalNAc]([cl6G])}|' +
    'RNA45{[guane2]([impr2G])}|RNA46{[hx]([isoG])}|RNA47{[imbu2r]([m1G])}|RNA48{[ime2r]([m22G])}|' +
    'RNA49{[ipr2r]([m2G])}|RNA50{[iprmno]([m6G])}|RNA51{[Ld]([m7G])}|RNA52{[Liprgl]([m7h8G])}|' +
    'RNA53{[lLR]([ms6G])}|RNA54{[Llyspn]([n8G])}|RNA55{[LR]([nC6n2G])}|RNA56{[Diprgl]([m3C])}$' +
    'RNA1,RNA2,1:R2-1:R1|RNA2,RNA3,1:R2-1:R1|RNA3,RNA4,1:R2-1:R1|RNA4,RNA5,1:R2-1:R1|' +
    'RNA5,RNA6,1:R2-1:R1|RNA6,RNA7,1:R2-1:R1|RNA7,RNA8,1:R2-1:R1|RNA8,RNA9,1:R2-1:R1|' +
    'RNA9,RNA10,1:R2-1:R1|RNA10,RNA11,1:R2-1:R1|RNA11,RNA12,1:R2-1:R1|RNA12,RNA13,1:R2-1:R1|' +
    'RNA13,RNA14,1:R2-1:R1|RNA14,RNA15,1:R2-1:R1|RNA15,RNA16,1:R2-1:R1|RNA16,RNA17,1:R2-1:R1|' +
    'RNA17,RNA18,1:R2-1:R1|RNA18,RNA19,1:R2-1:R1|RNA19,RNA20,1:R2-1:R1|RNA20,RNA21,1:R2-1:R1|' +
    'RNA21,RNA22,1:R2-1:R1|RNA22,RNA23,1:R2-1:R1|RNA23,RNA56,1:R2-1:R1|RNA56,RNA24,1:R2-1:R1|' +
    'RNA24,RNA25,1:R2-1:R1|RNA25,RNA26,1:R2-1:R1|RNA26,RNA27,1:R2-1:R1|RNA27,RNA28,1:R2-1:R1|' +
    'RNA28,RNA29,1:R2-1:R1|RNA29,RNA30,1:R2-1:R1|RNA30,RNA31,1:R2-1:R1|RNA31,RNA32,1:R2-1:R1|' +
    'RNA32,RNA33,1:R2-1:R1|RNA33,RNA34,1:R2-1:R1|RNA34,RNA35,1:R2-1:R1|RNA35,RNA36,1:R2-1:R1|' +
    'RNA36,RNA37,1:R2-1:R1|RNA37,RNA38,1:R2-1:R1|RNA38,RNA39,1:R2-1:R1|RNA39,RNA40,1:R2-1:R1|' +
    'RNA40,RNA41,1:R2-1:R1|RNA41,RNA42,1:R2-1:R1|RNA42,RNA43,1:R2-1:R1|RNA43,RNA44,1:R2-1:R1|' +
    'RNA44,RNA45,1:R2-1:R1|RNA45,RNA46,1:R2-1:R1|RNA46,RNA47,1:R2-1:R1|RNA47,RNA48,1:R2-1:R1|' +
    'RNA48,RNA49,1:R2-1:R1|RNA49,RNA50,1:R2-1:R1|RNA50,RNA51,1:R2-1:R1|RNA51,RNA52,1:R2-1:R1|' +
    'RNA52,RNA53,1:R2-1:R1|RNA53,RNA54,1:R2-1:R1|RNA54,RNA55,1:R2-1:R1$$$V2.0',

  'RNA1{[LR]([nC6n2G])}|RNA2{[m2e2r]([nen2G])}|RNA3{[m2nc2r]([npr2G])}|RNA4{[m2nenc]([o8G])}|' +
    'RNA5{[m2npr2]([o8s9G])}|RNA6{[m3ALln]([s6G])}|RNA7{[m3ana]([s8G])}|RNA8{[m5d]([z7G])}|' +
    'RNA9{[m5m]([z8c3G])}|RNA10{[me3d]([cnes4T])}|RNA11{[me3fl2]([cneT])}|RNA12{[me3m]([h56T])}|' +
    'RNA13{[me3r]([mo4bn3])}|RNA14{[meclna]([npomT])}|RNA15{[menoe2]([s2T])}|RNA16{[mn2lna]([s4T])}|' +
    'RNA17{[mnc2r]([z5T])}|RNA18{[mne2r]([5eU])}|RNA19{[mnobna]([5fU])}|RNA20{[MOE]([5iU])}|' +
    'RNA21{[moe3an]([5tpU])}|RNA22{[moeon2]([allyl5])}|RNA23{[mon2ln]([br5U])}|' +
    'RNA24{[mopr2d]([brviny])}|RNA25{[mph]([cl5U])}|RNA26{[mR]([CN5U])}|RNA27{[ms2r]([cpU])}|' +
    'RNA28{[mse2r]([d4U])}|RNA29{[mseac]([DBCOnC])}|RNA30{[msoe2r]([e5U])}|RNA31{[n2r]([form5U])}|' +
    'RNA32{[n3co4d]([h456U])}|RNA33{[n3d]([h456UR])}|RNA34{[n3fl2r]([hU])}|RNA35{[n3m]([ipr5U])}|' +
    'RNA36{[n5d]([m1Yra])}|RNA37{[n5fl2r]([m3U])}|RNA38{[n5m]([m6T])}|RNA39{[n5r]([m6U])}|' +
    'RNA40{[nac2r]([mnm5U])}|RNA41{[nbu2r]([mo5U])}|RNA42{[nC52r]([nC65U])}|RNA43{[nC62r]([nC6n5U])}|' +
    'RNA44{[ne2r]([npr5U])}|RNA45{[nma]([oh5U])}|RNA46{[Nmc]([ohm5U])}|RNA47{[npr2r]([Oro])}|' +
    'RNA48{[oC11o]}|RNA49{[oC12o]}|RNA50{[oC3o]}|RNA51{[oC4o]}|RNA52{[oC5o]}|RNA53{[oC6o]}|' +
    'RNA54{[oC7o]}|RNA55{[ox23ar]([thiz5U])}|RNA56{[ph2r]([vinyl5])}$RNA2,RNA3,1:R2-1:R1|' +
    'RNA3,RNA4,1:R2-1:R1|RNA4,RNA5,1:R2-1:R1|RNA5,RNA6,1:R2-1:R1|RNA6,RNA7,1:R2-1:R1|' +
    'RNA7,RNA8,1:R2-1:R1|RNA8,RNA9,1:R2-1:R1|RNA9,RNA10,1:R2-1:R1|RNA10,RNA11,1:R2-1:R1|' +
    'RNA11,RNA12,1:R2-1:R1|RNA12,RNA13,1:R2-1:R1|RNA13,RNA14,1:R2-1:R1|RNA14,RNA15,1:R2-1:R1|' +
    'RNA15,RNA16,1:R2-1:R1|RNA16,RNA17,1:R2-1:R1|RNA17,RNA18,1:R2-1:R1|RNA18,RNA19,1:R2-1:R1|' +
    'RNA19,RNA20,1:R2-1:R1|RNA20,RNA21,1:R2-1:R1|RNA21,RNA22,1:R2-1:R1|RNA22,RNA23,1:R2-1:R1|' +
    'RNA23,RNA24,1:R2-1:R1|RNA24,RNA25,1:R2-1:R1|RNA25,RNA26,1:R2-1:R1|RNA26,RNA27,1:R2-1:R1|' +
    'RNA27,RNA28,1:R2-1:R1|RNA28,RNA29,1:R2-1:R1|RNA29,RNA30,1:R2-1:R1|RNA30,RNA31,1:R2-1:R1|' +
    'RNA31,RNA32,1:R2-1:R1|RNA32,RNA33,1:R2-1:R1|RNA33,RNA34,1:R2-1:R1|RNA34,RNA35,1:R2-1:R1|' +
    'RNA35,RNA36,1:R2-1:R1|RNA36,RNA37,1:R2-1:R1|RNA37,RNA38,1:R2-1:R1|RNA38,RNA39,1:R2-1:R1|' +
    'RNA39,RNA40,1:R2-1:R1|RNA40,RNA41,1:R2-1:R1|RNA41,RNA42,1:R2-1:R1|RNA42,RNA43,1:R2-1:R1|' +
    'RNA43,RNA44,1:R2-1:R1|RNA44,RNA45,1:R2-1:R1|RNA45,RNA46,1:R2-1:R1|RNA46,RNA47,1:R2-1:R1|' +
    'RNA47,RNA48,1:R2-1:R1|RNA48,RNA49,1:R2-1:R1|RNA49,RNA50,1:R2-1:R1|RNA50,RNA51,1:R2-1:R1|' +
    'RNA51,RNA52,1:R2-1:R1|RNA52,RNA53,1:R2-1:R1|RNA53,RNA54,1:R2-1:R1|RNA54,RNA55,1:R2-1:R1|' +
    'RNA55,RNA56,1:R2-1:R1|RNA1,RNA2,1:R2-1:R1$$$V2.0',

  'RNA1{[phoe2r]([z6pry5])}|RNA2{[phs2r]([z6U])}|RNA3{[pna]([tfU])}|RNA4{[PONA]([thien5])}|' +
    'RNA5{[pr2r]([pr56U])}|RNA6{[prparg]([prpU])}|RNA7{[pyren1]([psiU])}|RNA8{[qR]([s2U])}|' +
    'RNA9{[Rcet]([s4U])}|RNA10{[Rcmoe]([io5C])}|RNA11{[Rflcln]([c7py7A])}|RNA12{[RGNA]([2imen2])}|' +
    'RNA13{[Rhe5d]([m2nprn])}|RNA14{[Rm5ALl]([c7py7N])}|RNA15{[Rm5d]([c7A])}|RNA16{[Rm5fl2]([m1A])}|' +
    'RNA17{[Rm5lna]([c7cn7A])}|RNA18{[Rm5moe]([cl2A])}|RNA19{[Rmclna]}|RNA20{[Rmn2ce]}|RNA21{[Rs2cEt]}|' +
    'RNA22{[Rso2ln]}|RNA23{[Rso2ln]}|RNA24{[RSpabC]}|RNA25{[s2lna]}|RNA26{[s3d]}|RNA27{[s4d]}|' +
    'RNA28{[s4m]}|RNA29{[s4moe]}|RNA30{[s5d]}|RNA31{[Scmoe]}|RNA32{[ScPr]}|RNA33{[se2r]}|' +
    'RNA34{[SGNA]}|RNA35{[She5d]}|RNA36{[Sm2moe]}|RNA37{[Sm5ALl]}|RNA38{[Sm5d]}|RNA39{[Sm5fl2]}|' +
    'RNA40{[Sm5lna]}|RNA41{[Sm5moe]}|RNA42{[Sm6ALl]}|RNA43{[Sm6fhn]}|RNA44{[Smc]}|RNA45{[Smclna]}|' +
    'RNA46{[Smn2ce]}|RNA47{[Sp18]}|RNA48{[SRpabC]}|RNA49{[Ss2cEt]}|RNA50{[Svinyl]}|RNA51{[tcdna]}|' +
    'RNA52{[tR]}|RNA53{[trimoe]}|RNA54{[trina1]}|RNA55{[trina2]}|RNA56{[UNA]}$RNA2,RNA3,1:R2-1:R1|' +
    'RNA3,RNA4,1:R2-1:R1|RNA4,RNA5,1:R2-1:R1|RNA5,RNA6,1:R2-1:R1|RNA6,RNA7,1:R2-1:R1|' +
    'RNA7,RNA8,1:R2-1:R1|RNA8,RNA9,1:R2-1:R1|RNA9,RNA10,1:R2-1:R1|RNA10,RNA11,1:R2-1:R1|' +
    'RNA11,RNA12,1:R2-1:R1|RNA12,RNA13,1:R2-1:R1|RNA13,RNA14,1:R2-1:R1|RNA14,RNA15,1:R2-1:R1|' +
    'RNA15,RNA16,1:R2-1:R1|RNA16,RNA17,1:R2-1:R1|RNA17,RNA18,1:R2-1:R1|RNA18,RNA19,1:R2-1:R1|' +
    'RNA19,RNA20,1:R2-1:R1|RNA20,RNA21,1:R2-1:R1|RNA21,RNA22,1:R2-1:R1|RNA22,RNA23,1:R2-1:R1|' +
    'RNA23,RNA24,1:R2-1:R1|RNA24,RNA25,1:R2-1:R1|RNA25,RNA26,1:R2-1:R1|RNA26,RNA27,1:R2-1:R1|' +
    'RNA27,RNA28,1:R2-1:R1|RNA28,RNA29,1:R2-1:R1|RNA29,RNA30,1:R2-1:R1|RNA30,RNA31,1:R2-1:R1|' +
    'RNA31,RNA32,1:R2-1:R1|RNA32,RNA33,1:R2-1:R1|RNA33,RNA34,1:R2-1:R1|RNA34,RNA35,1:R2-1:R1|' +
    'RNA35,RNA36,1:R2-1:R1|RNA36,RNA37,1:R2-1:R1|RNA37,RNA38,1:R2-1:R1|RNA38,RNA39,1:R2-1:R1|' +
    'RNA39,RNA40,1:R2-1:R1|RNA40,RNA41,1:R2-1:R1|RNA41,RNA42,1:R2-1:R1|RNA42,RNA43,1:R2-1:R1|' +
    'RNA43,RNA44,1:R2-1:R1|RNA44,RNA45,1:R2-1:R1|RNA45,RNA46,1:R2-1:R1|RNA46,RNA47,1:R2-1:R1|' +
    'RNA47,RNA48,1:R2-1:R1|RNA48,RNA49,1:R2-1:R1|RNA49,RNA50,1:R2-1:R1|RNA50,RNA51,1:R2-1:R1|' +
    'RNA51,RNA52,1:R2-1:R1|RNA52,RNA53,1:R2-1:R1|RNA53,RNA54,1:R2-1:R1|RNA54,RNA55,1:R2-1:R1|' +
    'RNA55,RNA56,1:R2-1:R1|RNA1,RNA2,1:R2-1:R1$$$V2.0',

  'CHEM1{([4aPEGMal],[4FB],[MCC],[sDBL])}|PEPTIDE1{(A,C,D,E)}|RNA1{([25mo3r],[25R])(A,C,G,T,U)' +
    '([gly],[hn])}|RNA2{[5cGT][ibun]}|RNA3{[dier]}|RNA4{[5FBC6][m2nen]}$PEPTIDE1,CHEM1,1:R2-1:R1|' +
    'PEPTIDE1,RNA1,1:R1-3:R2$$$V2.0',

  'PEPTIDE1{[bAla].[Cha].[Cya].[D-1Nal].[D-2Nal].[D-2Pal].[D-2Thi].[D-3Pal].[D-Abu].[D-Cha].[meA].' +
    '[NMebAl].[Thi].[Tza].[dA].[1Nal].[2Nal].[3Pal].[4Pal].[Abu].[Cys_Bn].[Cys_Me].[Dha].[dC].[Edc].' +
    '[Hcy].[meC].[AspOMe].[dD].[meD].[dE].[gGlu].[Gla].[meE].[aMePhe].[Bip].[Bpa].[dF].[DPhe4C].' +
    '[DPhe4F].[DPhe4u].[hPhe].[meF].[Phe_2F].[Phe_3F].[Phe_4F].[Phe_4I].[Chg].[D-Chg].[D-Phg].' +
    '[D-Pyr].[PheNO2].[Phebbd].[PheaDH].[Phe4SD].[Phe4NO].[Phe4NH].[Phe4Me].[Phe4Cl].[Phe4Br].' +
    '[Phe3Cl].[Phe34d].[Phe2Me].[meQ].[dQ].[xiHyp].[Thz].[DAGlyO].[D-Nle].[Ar5c].[Orn].[meK].' +
    '[LysMe3].[LysiPr].[LysBoc].[Nle].[meL].[Hyp].[Mhp].[Cit].[D-Cit].[D-hArg].[DhArgE].[dR].' +
    '[Har].[hArg].[LhArgE].[meR].[D-Dap].[Dap].[dS].[DSerBn].[DSertB].[Hse].[meS].[Ser_Bn].[SerPO3].' +
    '[SertBu].[aThr].[D-aThr].[dT].[D-Pen].[DaMeAb].[dV].[Iva].[Val3OH].[DTrp2M].[DTrpFo].[dW].' +
    '[Kyn].[meW].[Trp_Me].[Trp5OH].[TrpOme].[2Abz].[3Abz].[4Abz].[Abu23D].[Bmt].[Azi].[Asu].[App].' +
    '[Apm].[Aoda].[Cap].[Ac3c].[Ac6c].[Aca].[Aib].[D-Bmt].[D-Dab].[D-Dip].[D-Pip].[D-Tic].[Dab].' +
    '[meV].[Nva].[Pen].[dL].[ThrPO3].[xiThr].[dU].[meU].[D-Nva].[meT].[Dip].[Dsu].[dN].[meN].[dO].' +
    '[meO].[aHyp].[aMePro].[Aze]}$$$$V2.0',

  'PEPTIDE1{[D-aHyp].[D-Hyp].[D-Thz].[dP].[Pyr].[dH].[DHis1B].[Hhs].[His1Bn].[His1Me].[His3Me].' +
    '[meH].[aIle].[D-aIle].[dI].[DxiIle].[meI].[xiIle].[Aad].[D-Orn].[dK].[Dpm].[Hyl5xi].' +
    '[Lys_Ac].[tLeu].[dM].[DMetSO].[meM].[Met_O].[Met_O2].[Phg].[meG].[GlycPr].[Phg].[meG].[GlycPr].' +
    '[Glyall].[TyrtBu].[TyrSO3].[TyrPO3].[TyrPh4].[TyrabD].[Tyr3OH].[Tyr3NO].[Tyr35d].[Tyr26d].' +
    '[Tyr_Me].[Tyr_Bn].[Tyr_3I].[nTyr].[meY].[dY].[DTyrMe].[DTyrEt].[NMe2Ab].[NMe4Ab].[Pqa].[pnT].' +
    '[pnG].[pnC].[pnA].[Pip].[Oic].[Oic3aR].[Oic3aS].[Sta].[Sta3xi].[Tic].[Wil].[aMeTy3].[aMeTyr].' +
    '[D-nTyr].[D-gGlu].[D-hPhe].[Bux]}$$$$V2.0',

  'PEPTIDE1{[DACys].[Ala-al]}|PEPTIDE2{[DAlaol].[Ala-ol]}|PEPTIDE3{[D-OAla].[Gly-al]}|' +
    'PEPTIDE4{[L-OAla].[Phg-ol]}|PEPTIDE5{[DAhPhe].[-NHBn]}|PEPTIDE6{[DAPhg3].[Phe-al]}|' +
    'PEPTIDE7{[DAGlyB].[-NHEt]}|PEPTIDE8{[PhLA].[Phe-ol]}|PEPTIDE9{[DAGlyC].[Lys-ol]}|' +
    'PEPTIDE10{[DAGlyP].[Arg-al]}|PEPTIDE11{[DAGlyT].[DPhgol]}$$$$V2.0',

  'PEPTIDE1{[DAPhg4].[Pro-ol]}|PEPTIDE2{[DALeu].[Leu-ol]}|PEPTIDE3{[OLeu].[-OtBu]}|' +
    'PEPTIDE4{[meP].[Pro-al]}|PEPTIDE5{[D-OVal].[dThrol]}|PEPTIDE6{[L-OVal].[-Et]}|' +
    'PEPTIDE7{[Ac-].[-Bn]}|PEPTIDE8{[Bua-].[-OEt]}|PEPTIDE9{[Cbz-].[-Ph]}|' +
    'PEPTIDE10{[Bn-].[-Am]}|PEPTIDE11{[DANcy].[Leu-al]}$$$$V2.0',

  'PEPTIDE1{[fmoc-].[Thr-ol]}|PEPTIDE2{[DADip].[Val-ol]}|PEPTIDE3{[Glc].[-Me]}|' +
    'PEPTIDE4{[Boc-].[Aib-ol]}|PEPTIDE5{[Bz-]}|PEPTIDE6{[DAChg].[DADab]}|PEPTIDE7{[NHBn-].[Gly-ol]}|' +
    'PEPTIDE8{[MsO-].[Lys-al]}|PEPTIDE9{[Mpa].[Asp-al]}|PEPTIDE10{[Et-].[DProol]}|PEPTIDE11{[Me-].[Hsl]}$$$$V2.0',

  'PEPTIDE1{[Hva]}|PEPTIDE2{[Mba]}|PEPTIDE3{[OMe-].[-NMe]}|PEPTIDE4{[NMe24A].[-OBn]}|' +
    'PEPTIDE5{[NMe23A].[DTyr3O]}|PEPTIDE6{[OBn-].[Oxa]}|PEPTIDE7{[DAnTyr].[Pyrro]}|' +
    'PEPTIDE8{[Tos-].[-OMe]}$$$$V2.0',
];

test('2. Check that in snake mode all modifid monomers are marked', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6206
    Description: Check that in sequence mode all modifid monomers are marked
    Case: 
        1. Open HELM with all not modified monomers at snake mode
        2. Take a screenshot to verify that all modified monomers are marked
    */
  await selectSnakeLayoutModeTool(page);
  for (const modifiedMonomer of modifiedMonomers) {
    await pasteFromClipboardAndAddToMacromoleculesCanvas(
      page,
      MacroFileType.HELM,
      modifiedMonomer,
    );
    await takeEditorScreenshot(page, { hideMonomerPreview: true });
    await selectClearCanvasTool(page);
  }
});

test(
  '3. Switching from Flex to Snake and back to Flex does not change layout',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
    IMPORTANT: Test case works wrong because of the bug: https://github.com/epam/ketcher/issues/6940

    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Snake mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Snake-mode/SnakeModeBypassCheck.ket',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test(
  '4. Switching from Flex mode to Snake and to Micromolecules mode does not change layout',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
    IMPORTANT: Test case works wrong because of the bug: https://github.com/epam/ketcher/issues/6943

    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Go to Macro - Flex mode
        2. Load from KET custom monomer layout configuration
        3. Go to Macro - Snake mode
        2. Switch to Micromolecules mode
        3. Take screenshot to withness monomer
    */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Snake-mode/SnakeModeBypassCheck.ket',
      page,
    );
    await selectSnakeLayoutModeTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test('5. Switching from Micro mode to Snake and back to Micromolecules mode does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Go to Macro - Snake mode
        2. Go to Micro mode
        3. Load from KET custom monomer layout configuration
        2. Switch to Macro - Snake mode and back to Micro mode
        3. Take screenshot to withness monomer
    */
  // switching to Snake to change default Macro mode
  await selectSnakeLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await turnOnMacromoleculesEditor(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('6. Switching from Flex to Sequence and back to Flex mode does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Sequence mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await selectSequenceLayoutModeTool(page);
  await selectFlexLayoutModeTool(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('7. Switching from Flex mode to Sequence and to Micromolecules mode does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Go to Macro - Flex mode
        2. Load from KET custom monomer layout configuration
        3. Go to Macro - Sequence mode
        2. Switch to Micromolecules mode
        3. Take screenshot to withness monomer
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await selectSequenceLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('8. Switching from Micro mode to Sequence and back to Micromolecules mode does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Go to Macro - Snake mode
        2. Go to Micro mode
        3. Load from KET custom monomer layout configuration
        2. Switch to Macro - Sequence mode and back to Micro mode
        3. Take screenshot to withness monomer
    */
  // switching to Sequence to change default Macro mode
  await selectSequenceLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await turnOnMacromoleculesEditor(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('9. Switching from Flex to Snake, Sequence and back to Flex does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Snake mode, Sequence mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await selectSnakeLayoutModeTool(page);
  await selectSequenceLayoutModeTool(page);
  await selectFlexLayoutModeTool(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('10. Switching from Flex to Sequence, Snake and back to Flex does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Snake mode, Sequence mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await selectSequenceLayoutModeTool(page);
  await selectSnakeLayoutModeTool(page);
  await selectFlexLayoutModeTool(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test('11. Switching from Micro to Snake, Sequence and to Flex does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Switch to Snake mode to make if default
        2. Go to Micro mode - Load from KET custom monomer layout configuration
        3. Switch to Macro-Snake mode, Sequence mode and back to Flex
        4. Take screenshot to withness layour remain unchanged
    */
  await selectSnakeLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await turnOnMacromoleculesEditor(page);
  // Here we are at the Snake mode
  await selectSequenceLayoutModeTool(page);
  await selectFlexLayoutModeTool(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(
  '12. Switching from Micro to Sequence, Snake and to Flex does not change layout',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
    IMPORTANT: Test case works wrong because of the bug: https://github.com/epam/ketcher/issues/6940

    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Switch to Sequence mode to make if default
        2. Go to Micro mode - Load from KET custom monomer layout configuration
        3. Switch to Macro-Snake mode, Sequence mode and back to Flex
        4. Take screenshot to withness layour remain unchanged
    */
    await selectSequenceLayoutModeTool(page);
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Snake-mode/SnakeModeBypassCheck.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    // Here we are at the Sequence mode
    await selectSnakeLayoutModeTool(page);
    await selectFlexLayoutModeTool(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test('13. Switching from Flex to Snake, Sequence and to Micro does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Snake mode, Sequence mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await selectSnakeLayoutModeTool(page);
  await selectSequenceLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(
  '14. Switching from Flex to Sequence, Snake and to Micro does not change layout',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
    IMPORTANT: Test case works wrong because of the bug: https://github.com/epam/ketcher/issues/6943

    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Snake mode, Sequence mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
    await selectFlexLayoutModeTool(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Snake-mode/SnakeModeBypassCheck.ket',
      page,
    );
    await selectSequenceLayoutModeTool(page);
    await selectSnakeLayoutModeTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test('15. Switching from Micro to Snake, Sequence and to Micro does not change layout', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Switch to Snake mode to make if default
        2. Go to Micro mode - Load from KET custom monomer layout configuration
        3. Switch to Macro-Snake mode, Sequence mode and Micro mode
        4. Take screenshot to withness layour remain unchanged
    */
  await selectSnakeLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassCheck.ket',
    page,
  );
  await turnOnMacromoleculesEditor(page);
  // Here we are at the Snake mode
  await selectSequenceLayoutModeTool(page);
  await turnOnMicromoleculesEditor(page);
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });
});

test(
  '16. Switching from Micro to Sequence, Snake and to Micro does not change layout',
  { tag: ['@IncorrectResultBecauseOfBug'] },
  async () => {
    /*
    IMPORTANT: Test case works wrong because of the bug: https://github.com/epam/ketcher/issues/6943

    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Switch to Sequence mode to make if default
        2. Go to Micro mode - Load from KET custom monomer layout configuration
        3. Switch to Macro-Snake mode, Sequence mode and back to Flex
        4. Take screenshot to withness layour remain unchanged
    */
    await selectSequenceLayoutModeTool(page);
    await turnOnMicromoleculesEditor(page);
    await openFileAndAddToCanvasAsNewProjectMacro(
      'KET/Snake-mode/SnakeModeBypassCheck.ket',
      page,
    );
    await turnOnMacromoleculesEditor(page);
    // Here we are at the Sequence mode
    await selectSnakeLayoutModeTool(page);
    await turnOnMicromoleculesEditor(page);
    await takeEditorScreenshot(page, {
      hideMonomerPreview: true,
      hideMacromoleculeEditorScrollBars: true,
    });
  },
);

test('17. Check that when the user exports the canvas in snake mode, the exported file contain coordinates/monomer positions shown on the screen (for KET, Mol, and SVG)', async () => {
  /*
    Test task: https://github.com/epam/ketcher/issues/6935
    Description: Check that if the user enters the snake layout mode, but does not make any changes
                 to the structure before entering some other mode (flex, sequence, small molecules)
                 the snake layout not be retained
    Case: 
        1. Being on Flex mode - Load from KET custom monomer layout configuration
        2. Switch to Snake mode and back to Flex
        3. Take screenshot to withness layour remain unchanged
    */
  await selectFlexLayoutModeTool(page);
  await openFileAndAddToCanvasAsNewProjectMacro(
    'KET/Snake-mode/SnakeModeBypassExport.ket',
    page,
  );
  await selectSnakeLayoutModeTool(page);

  await verifyFileExport(
    page,
    'KET/Snake-mode/SnakeModeBypassExport-expected.ket',
    FileType.KET,
  );

  await verifyFileExport(
    page,
    'KET/Snake-mode/SnakeModeBypassExport-expected.mol',
    FileType.MOL,
  );

  await selectSaveTool(page);
  await chooseFileFormat(page, 'SVG Document');
  await takeEditorScreenshot(page, {
    hideMonomerPreview: true,
    hideMacromoleculeEditorScrollBars: true,
  });

  await pressButton(page, 'Cancel');
});
