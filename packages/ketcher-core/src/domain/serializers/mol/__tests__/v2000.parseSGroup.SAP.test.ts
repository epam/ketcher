import sGroup from 'domain/serializers/mol/parseSGroup';

describe('parseSGroup', () => {
  it('parseSGroupSAPLineV2000 should parse valid SAP line with one attachment point', () => {
    const ctabLine = '   1  1   2   0   ';

    const { sGroupId, attachmentPoints } =
      sGroup.parseSGroupSAPLineV2000(ctabLine);

    expect(sGroupId).toBe(0);
    expect(attachmentPoints[0].atomId).toBe(1);
    expect(attachmentPoints[0].leaveAtomId).toBeUndefined();
    expect(attachmentPoints[0].attachmentId).toBe('  ');
  });

  it('parseSGroupSAPLineV2000 should parse valid SAP line with two attachment points', () => {
    const ctabLine = '   1  2   2   0      3   1   ';

    const { sGroupId, attachmentPoints } =
      sGroup.parseSGroupSAPLineV2000(ctabLine);

    expect(sGroupId).toBe(0);
    expect(attachmentPoints.length).toBe(2);
    expect(attachmentPoints[1].atomId).toBe(2);
    expect(attachmentPoints[1].leaveAtomId).toBe(0);
    expect(attachmentPoints[1].attachmentId).toBe('  ');
  });
});
