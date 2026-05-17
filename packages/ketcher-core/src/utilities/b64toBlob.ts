export function b64toBlob(
  b64Data: string,
  contentType = '',
  sliceSize = 512,
): Blob {
  const byteCharacters: string = window.atob(b64Data);
  const byteArrays: Array<ArrayBuffer> = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice: string = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers: Array<number> = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const arrayBuffer = new ArrayBuffer(byteNumbers.length);
    const byteArray = new Uint8Array(arrayBuffer);
    byteArray.set(byteNumbers);
    byteArrays.push(arrayBuffer);
  }

  const blob: Blob = new Blob(byteArrays, { type: contentType });
  return blob;
}
