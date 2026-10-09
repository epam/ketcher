/**
 * Returns the image file the user has put on the clipboard (copied image,
 * screenshot or a file copied in a file manager), or undefined when the
 * clipboard should be handled as a structure.
 *
 * Text next to an image means the source also offers a structure (a molfile
 * or SMILES from a chemistry application), so the structure wins. A file
 * manager may add the file name as text; that does not count.
 */
export function getImageFileFromClipboardData(
  clipboardData: DataTransfer | null | undefined,
): File | undefined {
  const files = Array.from(clipboardData?.files ?? []);
  const imageFile = files.find((file) => file.type.startsWith('image/'));
  if (!imageFile) {
    return undefined;
  }

  const text = clipboardData?.getData('text/plain').trim() ?? '';
  const isFileNameOnly = files.some((file) => file.name === text);
  return text && !isFileNameOnly ? undefined : imageFile;
}
