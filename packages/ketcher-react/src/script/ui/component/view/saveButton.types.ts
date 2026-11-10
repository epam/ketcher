export type FileSaverReturnType = Promise<
  (
    data: Blob | string,
    filename: string,
    type: string | undefined,
  ) => void | never
>;

export type SaverType = Awaited<FileSaverReturnType>;
