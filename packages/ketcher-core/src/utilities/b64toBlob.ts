/* eslint-disable no-undef */
export function b64toBlob(
  b64Data: string,
  contentType = '',
  sliceSize = 512,
): Blob {
  const byteCharacters: string = window.atob(b64Data);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice: string = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers: Array<number> = new Array(slice.length);

    for (let index = 0; index < slice.length; index++) {
      byteNumbers[index] = slice.charCodeAt(index);
    }

    const byteArray: Uint8Array = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob: Blob = new Blob(byteArrays as BlobPart[], { type: contentType });
  return blob;
}
