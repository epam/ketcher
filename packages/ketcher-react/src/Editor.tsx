import { MicromoleculesEditor, EditorProps } from './MicromoleculesEditor';

type Props = EditorProps & {
  disableMacromoleculesEditor?: boolean;
};

/*
 * TODO:
 *  ketcher-macromolecules is imported asynchronously to avoid circular dependencies between it and ketcher-react
 *  and ts-ignore is needed to avoid TypeScript error as ketcher-react is built first
 *  so ketcher-macromolecules can't provide any typings while building ketcher-react.
 *  Consider refactoring/restructuring packages to avoid these two issues
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

export const Editor = (props: Props) => {
  return <MicromoleculesEditor {...props} togglerComponent={undefined} />;
};
