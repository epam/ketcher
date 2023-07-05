import { test, expect } from '@playwright/test';
import data from '@tests/test-data/request-data.json';
import molV3000TestData from '@tests/test-data/molV3000-result.json';

test('getting molV3000 from Indigo', async ({ request }) => {
  const molV3000Result = await request.post(
    `https://rc.test.lifescience.opensource.epam.com/v2/indigo/convert`,
    {
      data,
    }
  );
  const molV3000RFromIndigo = await molV3000Result.json();

  const [, , molV3000RFromIndigoWoFirstLine] =
    molV3000RFromIndigo.struct.split('\n');
  const [, , molV3000TestDataWoFirstLine] = molV3000TestData.struct.split('\n');

  expect(molV3000RFromIndigoWoFirstLine).toBe(molV3000TestDataWoFirstLine);
});
