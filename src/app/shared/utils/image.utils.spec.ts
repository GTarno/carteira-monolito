import { ImageFileError, imageErrorMessage, readImageAsDataUrl } from './image.utils';

async function pngFile(width: number, height: number): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')!.fillRect(0, 0, width, height);
  const blob: Blob = await new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'));
  return new File([blob], 'foto.png', { type: 'image/png' });
}

describe('readImageAsDataUrl', () => {
  it('scales large images down to a JPEG data URL', async () => {
    const dataUrl = await readImageAsDataUrl(await pngFile(2000, 1000), 800);
    expect(dataUrl.startsWith('data:image/jpeg')).toBeTrue();

    const img = new Image();
    await new Promise(resolve => { img.onload = resolve; img.src = dataUrl; });
    expect(img.width).toBe(800);
    expect(img.height).toBe(400);
  });

  it('rejects files that are not images', async () => {
    const file = new File(['texto'], 'notas.txt', { type: 'text/plain' });
    await expectAsync(readImageAsDataUrl(file)).toBeRejectedWith(new ImageFileError('not-image'));
    expect(imageErrorMessage(new ImageFileError('not-image'))).toContain('arquivo de imagem');
  });
});
