export type FileSaverReturnType = Promise<
  (data: Blob | string, function_, type: string | undefined) => void | never
>;

export type SaverType = Awaited<FileSaverReturnType>;
