/** Tamanho máximo aceito do arquivo original (antes de reduzir). */
export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

export class ImageFileError extends Error {
  constructor(readonly reason: 'not-image' | 'too-large' | 'unreadable') {
    super(reason);
  }
}

/** Mensagem para o usuário a partir de um erro de `readImageAsDataUrl`. */
export function imageErrorMessage(error: unknown): string {
  switch (error instanceof ImageFileError ? error.reason : 'unreadable') {
    case 'not-image':
      return 'Escolha um arquivo de imagem (PNG, JPG, WebP...).';
    case 'too-large':
      return 'A imagem deve ter no máximo 10 MB.';
    default:
      return 'Não foi possível ler essa imagem. Tente outra.';
  }
}

/**
 * Lê uma imagem escolhida pelo usuário e a reduz para caber no localStorage:
 * o lado maior fica com no máximo `maxSize` px e o resultado é um data URL JPEG.
 * Uma foto de celular (~3 MB) vira algo em torno de 50–150 KB.
 */
export async function readImageAsDataUrl(file: File, maxSize = 800, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) throw new ImageFileError('not-image');
  if (file.size > MAX_SOURCE_IMAGE_BYTES) throw new ImageFileError('too-large');

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageFileError('unreadable');
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new ImageFileError('unreadable');

  // Fundo branco: imagens com transparência não ficam pretas ao virar JPEG
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', quality);
}
