/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import * as structFormat from '../../../../../data/convert/structConverter';

import { Component, createRef, MouseEvent, RefObject, type FC } from 'react';
import { createSelector } from 'reselect';
import Form, {
  Field,
  type FieldProps,
} from '../../../../../component/form/form/form';
import {
  FormatterFactory,
  KetSerializer,
  type FormatterFactoryOptions,
  type GenerateImageOptions,
  type OutputFormatType,
  formatProperties,
  getPropertiesByFormat,
  getPropertiesByImgFormat,
  b64toBlob,
  KetcherLogger,
  Atom,
  isClipboardAPIAvailable,
  legacyCopy,
  Struct,
  type StructService,
} from 'ketcher-core';

import { Dialog } from '../../../../components';
import Tabs from 'src/script/ui/component/view/Tabs';
import { ErrorsContext } from '../../../../../../../contexts';
import { SaveButton } from '../../../../../component/view/savebutton';
import { check } from '../../../../../state/server';
import classes from './Save.module.less';
import { connect } from 'react-redux';
import { saveUserTmpl } from '../../../../../state/templates';
import { updateFormState } from '../../../../../state/modal/form';
import Select, { type Option } from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';
import { IconButton } from 'components';
import { AnyAction, Dispatch } from 'redux';

type SaveImageFormat = OutputFormatType;
type SaveSupportedFormat = string;
type SaveFormat = string;
type SaveFormatOption = string;
type SaveServer = StructService &
  PromiseLike<unknown> & {
    generateImageAsBase64: (
      data: string,
      options?: GenerateImageOptions,
    ) => Promise<string>;
  };
type SaveServerSettings = FormatterFactoryOptions &
  Partial<GenerateImageOptions>;

interface ImageFormatProperties {
  extension: string;
  name: string;
}

interface SaveFormatFieldProps extends FieldProps {
  onChange?: (value: SaveFormat) => void;
  options: Option[];
}

const isImageFormat = (format: string): format is SaveImageFormat => {
  return format === 'svg' || format === 'png';
};

const isSupportedFormat = (format: string): format is SaveSupportedFormat => {
  return format in formatProperties;
};

const getImageFormatProperties = (
  format: SaveImageFormat,
): ImageFormatProperties | undefined => {
  return getPropertiesByImgFormat(format) as ImageFormatProperties | undefined;
};

const SaveFormatSelect = ({
  onChange,
  options,
  className,
  value,
  disabled,
  name,
  'data-testid': testId,
}: SaveFormatFieldProps) => (
  <Select
    className={className}
    value={typeof value === 'string' ? value : undefined}
    disabled={disabled}
    name={name}
    data-testid={testId}
    options={options}
    onChange={(value) => onChange?.(value as SaveFormat)}
  />
);

const SaveFormatField = Field as FC<
  FieldProps & {
    onChange?: (value: SaveFormat) => void;
  }
>;

const saveSchema = {
  title: 'Save',
  type: 'object',
  properties: {
    filename: {
      title: 'File name:',
      type: 'string',
      maxLength: 128,
      pattern: '^[^.<>:?"*\\\\|\\/][^<>:?"*\\\\|\\/]*$',
      invalidMessage: (res) => {
        if (!res) return 'Filename should contain at least one character';
        if (res.length > 128) return 'Filename is too long';
        return "A filename cannot contain characters: \\ / : * ? \" < > | and cannot start with '.'";
      },
    },
    format: {
      title: 'File format:',
      enum: Object.keys(formatProperties),
      enumNames: Object.keys(formatProperties).map(
        (format) => formatProperties[format].name,
      ),
    },
  },
};

// Type definitions for component props
interface LoadingStateProps {
  classes: typeof classes;
}

interface ImageContentProps {
  classes: typeof classes;
  format: string;
  imageSrc: string;
  isCleanStruct: boolean;
}

interface BinaryContentProps {
  classes: typeof classes;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
}

interface PreviewContentProps {
  classes: typeof classes;
  structStr: string;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  handleCopy: (event: MouseEvent<HTMLButtonElement>) => void;
}

interface FormState {
  result: {
    filename: string;
    format: SaveFormat;
  };
  valid: boolean;
  errors: Record<string, string>;
  moleculeErrors?: Record<string, string>;
}

interface CheckState {
  checkOptions: unknown;
}

interface Editor {
  selection: () => { atoms?: number[] } | null;
  errorHandler: (message: string) => void;
  struct: () => Struct;
  render: {
    options: {
      ignoreChiralFlag: boolean;
    };
  };
}

interface SaveDialogState {
  disableControls: boolean;
  imageFormat: SaveImageFormat;
  tabIndex: number;
  isLoading: boolean;
  structStr?: string;
  imageSrc?: string;
}

interface AppState {
  options: {
    app: {
      server?: boolean;
    };
    getServerSettings: () => SaveServerSettings;
    check: CheckState;
    settings: {
      bondThickness?: number;
    };
  };
  server: SaveServer;
  editor: Editor;
  modal: {
    form: FormState;
  };
}

interface SaveDialogOwnProps {
  onOk: (result?: Record<string, unknown>) => void;
  onCancel?: () => void;
}

interface SaveDialogProps extends SaveDialogOwnProps {
  server: SaveServer | null;
  struct: Struct;
  options: SaveServerSettings;
  formState: FormState;
  moleculeErrors?: Record<string, string>;
  checkState: CheckState;
  bondThickness?: number;
  ignoreChiralFlag: boolean;
  editor: Editor;
  onCheck: (checkOptions: unknown) => void;
  onTmplSave: (struct: Struct) => void;
  onResetForm: (prevState: FormState) => void;
}

// Extracted components for better performance and React best practices
const LoadingState = ({ classes }: LoadingStateProps) => (
  <div className={classes.loadingCirclesContainer}>
    <LoadingCircles />
  </div>
);

const getSupportedFormatProperties = (format: SaveSupportedFormat) => {
  return getPropertiesByFormat(
    format as Parameters<typeof getPropertiesByFormat>[0],
  );
};

const ImageContent = ({
  classes,
  format,
  imageSrc,
  isCleanStruct,
}: ImageContentProps) => (
  <div className={classes.imageContainer}>
    {!isCleanStruct && (
      <img
        src={`data:image/${format}+xml;base64,${imageSrc}`}
        alt={`${format} preview`}
        data-testid="preview-area"
      />
    )}
  </div>
);

const BinaryContent = ({ classes, textAreaRef }: BinaryContentProps) => (
  <div className={classes.previewBackground}>
    <textarea
      value="Can not display binary content"
      className={classes.previewArea}
      readOnly
      ref={textAreaRef}
      data-testid="preview-area"
    />
  </div>
);

const PreviewContent = ({
  classes,
  structStr,
  textAreaRef,
  handleCopy,
}: PreviewContentProps) => (
  <div className={classes.previewBackground}>
    <textarea
      value={structStr}
      className={classes.previewArea}
      readOnly
      ref={textAreaRef}
      data-testid="preview-area"
    />
    <IconButton
      onClick={handleCopy}
      iconName="copy"
      title="Copy to clipboard"
      testId="copy-to-clipboard"
    />
  </div>
);

class SaveDialog extends Component<SaveDialogProps, SaveDialogState> {
  static contextType = ErrorsContext;
  declare context: React.ContextType<typeof ErrorsContext>;
  private readonly isRxn: boolean;
  private readonly textAreaRef: RefObject<HTMLTextAreaElement | null>;
  private readonly saveSchema: typeof saveSchema;

  constructor(props: SaveDialogProps) {
    super(props);
    this.state = {
      disableControls: true,
      imageFormat: 'svg',
      tabIndex: 0,
      isLoading: true,
    };
    this.isRxn =
      this.props.struct.hasRxnArrow() || this.props.struct.hasMultitailArrow();
    this.textAreaRef = createRef();

    const formats: SaveFormatOption[] = !this.props.server
      ? ['ket', this.isRxn ? 'rxn' : 'mol', 'smiles']
      : [
          'ket',
          this.isRxn ? 'rxn' : 'mol',
          this.isRxn ? 'rxnV3000' : 'molV3000',
          'sdf',
          'sdfV3000',
          'rdf',
          'rdfV3000',
          'smarts',
          'smiles',
          'smilesExt',
          'cml',
          '<----firstDivider--->', // for dividers in select list
          'inChI',
          'inChIAuxInfo',
          'inChIKey',
          '<----secondDivider--->', // for dividers in select list
          'svg',
          'png',
          'cdxml',
          'cdx',
          'binaryCdx',
        ];

    this.saveSchema = saveSchema;
    this.saveSchema.properties.format = Object.assign(
      this.saveSchema.properties.format,
      {
        enum: formats,
        enumNames: formats.map((format) => {
          const formatProps = isSupportedFormat(format)
            ? getSupportedFormatProperties(format)
            : isImageFormat(format)
            ? getImageFormatProperties(format)
            : undefined;
          return formatProps?.name;
        }),
      },
    );
  }

  componentDidMount() {
    const { checkOptions } = this.props.checkState;
    this.props.onCheck(checkOptions);
    this.changeType(this.isRxn ? 'rxn' : 'mol').then(
      (res) => res instanceof Error && this.setState({ disableControls: true }),
    );
  }

  isBinaryCdxFormat = (format: string): boolean => {
    return format === 'binaryCdx';
  };

  showStructWarningMessage = (format: SaveFormat): boolean => {
    const { errors } = this.props.formState;
    return format !== 'mol' && Object.keys(errors).length > 0;
  };

  changeType = (type: SaveFormat): Promise<Error | void> => {
    const { struct, server, options, formState, ignoreChiralFlag } = this.props;

    const errorHandler = this.context.errorHandler;
    if (isImageFormat(type)) {
      const ketSerialize = new KetSerializer();
      const structStr = ketSerialize.serialize(struct);
      this.setState({
        disableControls: true,
        tabIndex: 0,
        imageFormat: type,
        structStr,
        isLoading: true,
      });
      const serverOptions: GenerateImageOptions = {
        ...options,
        outputFormat: type,
      };

      if (!server) {
        return Promise.resolve();
      }

      return server
        .generateImageAsBase64(structStr, serverOptions)
        .then((base64) => {
          this.setState({
            disableControls: false,
            tabIndex: 0,
            imageSrc: base64,
            isLoading: false,
          });
        })
        .catch((e) => {
          KetcherLogger.error('Save.jsx::SaveDialog::changeType', e);
          errorHandler(e);
          this.props.onResetForm(formState);
          return e;
        });
    } else {
      this.setState({ disableControls: true, isLoading: true });
      const factory = new FormatterFactory(server as SaveServer);
      // temporary check if query properties are used
      const queryPropertiesAreUsed = !!(
        type === 'mol' &&
        Array.from(struct.atoms as Iterable<[number, Atom]>).find(
          ([_, atom]) =>
            atom.queryProperties.aromaticity ||
            atom.queryProperties.connectivity ||
            atom.queryProperties.ringMembership ||
            atom.queryProperties.ringSize ||
            atom.queryProperties.customQuery ||
            atom.implicitHCount,
        )
      );
      const service = factory.create(
        type as Parameters<FormatterFactory['create']>[0],
        { ...options, ignoreChiralFlag },
        queryPropertiesAreUsed,
      );
      const getStructFromStringByType = () => {
        if (type === 'ket') {
          const selection = this.props.editor.selection();
          if (selection?.atoms?.length && selection.atoms.length > 0) {
            selection.atoms = selection.atoms.filter((selectedAtomId) => {
              return !Atom.isSuperatomLeavingGroupAtom(struct, selectedAtomId);
            });
          }
          return service.getStructureFromStructAsync(
            struct,
            undefined,
            selection || undefined,
          );
        }
        return service.getStructureFromStructAsync(struct);
      };
      return getStructFromStringByType()
        .then(
          (structStr) => {
            this.setState({
              tabIndex: 0,
              structStr,
            });
          },
          (e) => {
            errorHandler(e.message);
            this.props.onResetForm(formState);
            return e;
          },
        )
        .finally(() => {
          this.setState({
            disableControls: false,
            tabIndex: 0,
            isLoading: false,
          });
        });
    }
  };

  changeTab = (index: number): void => {
    this.setState({ tabIndex: index });
  };

  getWarnings = (format: SaveFormat): string[] => {
    const { struct, moleculeErrors } = this.props;
    const warnings: string[] = [];
    const structWarning =
      'Structure contains errors, please check the data, otherwise you ' +
      'can lose some properties or the whole structure after saving in this format.';
    if (!isImageFormat(format)) {
      const saveWarning = structFormat.couldBeSaved(
        struct,
        format as Parameters<typeof structFormat.couldBeSaved>[1],
      );
      const isStructInvalid = this.showStructWarningMessage(format);
      if (isStructInvalid) {
        warnings.push(structWarning);
      }
      if (saveWarning) {
        warnings.push(saveWarning);
      }
    }

    if (moleculeErrors) {
      const filteredMoleculeErrors = Object.values(moleculeErrors).filter(
        (error) => {
          if (format === 'smarts' || format === 'ket') {
            return !error.includes('Structure contains query features');
          } else {
            return true;
          }
        },
      );
      warnings.push(...filteredMoleculeErrors);
    }
    return warnings;
  };

  renderForm = (): JSX.Element => {
    const formState = { ...this.props.formState };
    const { filename, format } = formState.result;
    const warnings = this.getWarnings(format);
    const tabs =
      warnings.length === 0
        ? [
            {
              caption: 'Preview',
              component: this.renderSaveFile,
              tabIndex: 0,
            },
          ]
        : [
            {
              caption: 'Preview',
              component: this.renderSaveFile,
              tabIndex: 0,
            },
            {
              caption: 'Warnings',
              component: this.renderWarnings,
              tabIndex: 1,
            },
          ];

    return (
      <div className={classes.formContainer}>
        <Form
          schema={this.saveSchema}
          init={{
            filename,
            format: this.isRxn ? 'rxn' : 'mol',
          }}
          {...formState}
        >
          <Field name="filename" />
          <SaveFormatField
            name="format"
            onChange={this.changeType}
            options={getSelectOptionsFromSchema(
              this.saveSchema.properties.format,
            )}
            component={SaveFormatSelect}
            className="file-format-list"
            data-testid="file-format-list"
          />
        </Form>
        <Tabs
          className={classes.tabs}
          captions={tabs}
          tabIndex={this.state.tabIndex}
          changeTab={this.changeTab}
          tabs={tabs}
        />
      </div>
    );
  };

  handleCopy = (event: MouseEvent<HTMLButtonElement>): void => {
    const { structStr } = this.state;

    try {
      if (isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(structStr || '');
      } else {
        const clipboardData =
          (event.nativeEvent instanceof ClipboardEvent
            ? event.nativeEvent.clipboardData
            : undefined) ||
          (window as Window & { clipboardData?: DataTransfer }).clipboardData;

        if (!clipboardData) {
          throw new Error('Clipboard data is not available');
        }

        legacyCopy(clipboardData, {
          'text/plain': structStr,
        });
        event.preventDefault();
      }
    } catch (e) {
      KetcherLogger.error('copyAs.js::copyAs', e);
      this.props.editor.errorHandler(
        'This feature is not available in your browser',
      );
    }
  };

  renderSaveFile = (): JSX.Element | null => {
    const formState = { ...this.props.formState };
    delete formState.moleculeErrors;
    const { format } = formState.result;
    const { structStr, imageSrc, isLoading } = this.state;
    const isCleanStruct = this.props.struct.isBlank();

    if (isLoading) {
      return <LoadingState classes={classes} />;
    } else if (isImageFormat(format)) {
      return (
        <ImageContent
          classes={classes}
          format={format}
          imageSrc={imageSrc || ''}
          isCleanStruct={isCleanStruct}
        />
      );
    } else if (this.isBinaryCdxFormat(format)) {
      return <BinaryContent classes={classes} textAreaRef={this.textAreaRef} />;
    } else {
      return (
        <PreviewContent
          classes={classes}
          structStr={structStr || ''}
          textAreaRef={this.textAreaRef}
          handleCopy={this.handleCopy}
        />
      );
    }
  };

  renderWarnings = (): JSX.Element | null => {
    const formState = { ...this.props.formState };
    const { format } = formState.result;
    const warnings = this.getWarnings(format);

    return warnings.length ? (
      <div className={classes.warnings}>
        {warnings.map((warning) => (
          <div className={classes.warningsContainer} key={warning}>
            <span className={classes.warningsArr} data-testid="WarningTextArea">
              {warning}
            </span>
          </div>
        ))}
      </div>
    ) : null;
  };

  getButtons = (): JSX.Element[] => {
    const { disableControls, imageFormat, isLoading, structStr } = this.state;
    const { options, formState } = this.props;
    const { filename, format } = formState.result;
    const isCleanStruct = this.props.struct.isBlank();
    const imageOptions: GenerateImageOptions = {
      ...options,
      outputFormat: imageFormat,
    };

    const savingStruct =
      this.isBinaryCdxFormat(format) && !isLoading
        ? b64toBlob(structStr || '')
        : structStr;

    const isMoleculeContain =
      this.props.struct.atoms.size && this.props.struct.bonds.size;
    const buttons = [
      <button
        key="save-tmpl"
        className={classes.saveTmpl}
        disabled={disableControls || isCleanStruct || !isMoleculeContain}
        onClick={() => this.props.onTmplSave(this.props.struct)}
        data-testid="save-to-templates-button"
      >
        Save to Templates
      </button>,
    ];

    buttons.push(
      <button
        key="cancel"
        className={classes.cancel}
        onClick={() => this.props.onOk({})}
        type="button"
        data-testid="cancel-button"
      >
        Cancel
      </button>,
    );

    if (isImageFormat(format)) {
      buttons.push(
        <SaveButton
          mode="saveImage"
          options={imageOptions}
          data={structStr || ''}
          filename={filename}
          key="save-image-button"
          type={`image/${format}+xml`}
          onSave={this.props.onOk}
          testId="save-button"
          disabled={
            disableControls ||
            !formState.valid ||
            isCleanStruct ||
            !this.props.server
          }
          className={classes.ok}
        >
          Save
        </SaveButton>,
      );
    } else {
      buttons.push(
        <SaveButton
          mode="saveFile"
          data={savingStruct || ''}
          testId="save-button"
          filename={
            filename +
            (getSupportedFormatProperties(format).extensions[0] || '')
          }
          key="save-file-button"
          type={getSupportedFormatProperties(format).mime}
          server={this.props.server}
          onSave={this.props.onOk}
          disabled={disableControls || !formState.valid || isCleanStruct}
          className={classes.ok}
        >
          Save
        </SaveButton>,
      );
    }
    return buttons;
  };

  render(): JSX.Element {
    return (
      <Dialog
        className={classes.dialog}
        title="Save Structure"
        params={{
          onOk: (result) =>
            this.props.onOk(result as Record<string, unknown> | undefined),
          onCancel: this.props.onCancel || (() => null),
        }}
        buttons={this.getButtons()}
        needMargin={false}
        withDivider={true}
      >
        {this.renderForm()}
      </Dialog>
    );
  }
}

const getOptions = (state: AppState) => state.options;
const serverSettingsSelector = createSelector([getOptions], (options) =>
  options.getServerSettings(),
);

const mapStateToProps = (state: AppState) => ({
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  options: serverSettingsSelector(state),
  formState: state.modal.form,
  moleculeErrors: state.modal.form.moleculeErrors,
  checkState: state.options.check,
  bondThickness: state.options.settings.bondThickness,
  ignoreChiralFlag: state.editor.render.options.ignoreChiralFlag,
  editor: state.editor,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) => ({
  onCheck: (checkOptions: unknown) =>
    dispatch(check(checkOptions) as unknown as AnyAction),
  onTmplSave: (struct: Struct) =>
    dispatch(saveUserTmpl(struct) as unknown as AnyAction),
  onResetForm: (prevState: FormState) => dispatch(updateFormState(prevState)),
});

const Save = connect(
  mapStateToProps,
  mapDispatchToProps,
)(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error React 19 type mismatch in legacy connected class component
  SaveDialog,
);

export default Save;
