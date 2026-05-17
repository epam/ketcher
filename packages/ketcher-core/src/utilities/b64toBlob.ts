export function b64toBlob(
  b64Data: string,
  contentType = '',
  sliceSize = 512,
): Blob {
  const byteCharacters: string = window.atob(b64Data);
  const byteArrays: Array<BlobPart> = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice: string = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers: Array<number> = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray as BlobPart);
  }

  const blob: Blob = new Blob(byteArrays, { type: contentType });
  return blob;
}
