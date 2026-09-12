import { Indigo } from '../indigo';

describe('Indigo.generateImageAsBase64', () => {
  it('does not pass backgroundColor when it is not provided', async () => {
    const generateImageAsBase64 = jest.fn().mockResolvedValue('base64');
    const indigo = new Indigo({
      generateImageAsBase64,
    });

    await indigo.generateImageAsBase64('C');

    expect(generateImageAsBase64).toHaveBeenCalledWith('C', {
      outputFormat: 'png',
      bondThickness: expect.any(Number),
    });
    expect(generateImageAsBase64.mock.calls[0][1]).not.toHaveProperty(
      'backgroundColor',
    );
  });

  it('passes backgroundColor when it is provided', async () => {
    const generateImageAsBase64 = jest.fn().mockResolvedValue('base64');
    const indigo = new Indigo({
      generateImageAsBase64,
    });

    await indigo.generateImageAsBase64('C', {
      outputFormat: 'svg',
      backgroundColor: '255, 255, 255',
    });

    expect(generateImageAsBase64).toHaveBeenCalledWith('C', {
      outputFormat: 'svg',
      backgroundColor: '255, 255, 255',
      bondThickness: expect.any(Number),
    });
  });
});
