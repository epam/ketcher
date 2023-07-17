export type FileSaverReturnType = Promise<
  (data: Blob | string, fn, type: string | undefined) => void | never
>;

export type SaverType = Awaited<FileSaverReturnType>;
