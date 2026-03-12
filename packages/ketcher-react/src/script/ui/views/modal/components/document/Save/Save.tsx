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

import { Component, createRef, RefObject } from 'react';
import { createSelector } from 'reselect';
import Form, { Field } from '../../../../../component/form/form/form';
import {
  FormatterFactory,
  FormatterFactoryOptions,
  GenerateImageOptions,
  KetSerializer,
  formatProperties,
  getPropertiesByFormat,
  getPropertiesByImgFormat,
  b64toBlob,
  KetcherLogger,
  Atom,
  isClipboardAPIAvailable,
  legacyCopy,
  Struct,
  StructService,
  SupportedFormat,
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
import Select from '../../../../../component/form/Select';
import { getSelectOptionsFromSchema } from '../../../../../utils';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';
import { IconButton } from 'components';

type SaveDialogOptions = FormatterFactoryOptions & Partial<GenerateImageOptions>;
type CopyEvent = {
  clipboardData?: DataTransfer | null;
  preventDefault: () => void;
};
type DispatchProp = (action: unknown) => unknown;

const isSupportedStructFormat = (format: string): format is SupportedFormat =>
  Object.hasOwn(formatProperties, format);

const isImageOutputFormat = (
  format: string,
): format is GenerateImageOptions['outputFormat'] =>
  format === 'svg' || format === 'png';

const getFormatProperties = (format: string) =>
  isSupportedStructFormat(format)
    ? getPropertiesByFormat(format)
    : getPropertiesByImgFormat(format);

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
  handleCopy: (event: CopyEvent) => void;
}

interface FormState {
  result: {
    filename: string;
    format: string;
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

interface SaveDialogProps {
  server: StructService | null;
  struct: Struct;
  options: SaveDialogOptions;
  formState: FormState;
  moleculeErrors?: Record<string, string>;
  checkState: CheckState;
  bondThickness?: number;
  ignoreChiralFlag: boolean;
  editor: Editor;
  onCheck: (checkOptions: unknown) => void;
  onTmplSave: (struct: Struct) => void;
  onResetForm: (prevState: FormState) => void;
  onOk: (result?: Record<string, unknown>) => void;
  onCancel?: () => void;
}

interface SaveDialogState {
  disableControls: boolean;
  imageFormat: string;
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
    getServerSettings: () => SaveDialogOptions;
    check: CheckState;
    settings: {
      bondThickness?: number;
    };
  };
  server: StructService | null;
  editor: Editor;
  modal: {
    form: FormState;
  };
}

// Extracted components for better performance and React best practices
const LoadingState = ({ classes }: LoadingStateProps) => (
  <div className={classes.loadingCirclesContainer}>
    <LoadingCircles />
  </div>
);

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

    const formats = !this.props.server
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
          return getFormatProperties(format)?.name;
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

  isImageFormat = (format: string): boolean => {
    return isImageOutputFormat(format);
  };

  isBinaryCdxFormat = (format: string): boolean => {
    return format === 'binaryCdx';
  };

  showStructWarningMessage = (format: string): boolean => {
    const { errors } = this.props.formState;
    return format !== 'mol' && Object.keys(errors).length > 0;
  };

  changeType = (type: string): Promise<Error | void> => {
    const { struct, server, options, formState, ignoreChiralFlag } = this.props;

    const errorHandler = this.context.errorHandler;
    if (this.isImageFormat(type)) {
      const ketSerialize = new KetSerializer();
      const structStr = ketSerialize.serialize(struct);
      this.setState({
        disableControls: true,
        tabIndex: 0,
        imageFormat: type,
        structStr,
        isLoading: true,
      });
      const serverOptions = { ...options };

      serverOptions.outputFormat = type;

      return server!
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
      const factory = new FormatterFactory(server!);
      // temporary check if query properties are used
      const queryPropertiesAreUsed = !!(
        type === 'mol' &&
        Array.from(struct.atoms.values()).find(
          (atom) =>
            atom.queryProperties.aromaticity ||
            atom.queryProperties.connectivity ||
            atom.queryProperties.ringMembership ||
            atom.queryProperties.ringSize ||
            atom.queryProperties.customQuery ||
            atom.implicitHCount,
        )
      );
      if (!isSupportedStructFormat(type)) {
        return Promise.resolve(new Error(`Unsupported save format: ${type}`));
      }

      const service = factory.create(
        type,
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

  getWarnings = (format: string): string[] => {
    const { struct, moleculeErrors } = this.props;
    const warnings: string[] = [];
    const structWarning =
      'Structure contains errors, please check the data, otherwise you ' +
      'can lose some properties or the whole structure after saving in this format.';
    if (!this.isImageFormat(format)) {
      const saveWarning = isSupportedStructFormat(format)
        ? structFormat.couldBeSaved(struct, format)
        : null;
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
        (error: string) => {
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
          <Field
            name="format"
            onChange={this.changeType}
            options={getSelectOptionsFromSchema(
              this.saveSchema.properties.format,
            )}
            component={Select}
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

  handleCopy = (event: CopyEvent): void => {
    const { structStr } = this.state;

    try {
      if (isClipboardAPIAvailable()) {
        navigator.clipboard.writeText(structStr || '');
      } else {
        legacyCopy(event.clipboardData, {
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
    } else if (this.isImageFormat(format)) {
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
    const currentFormatProperties = isSupportedStructFormat(format)
      ? getPropertiesByFormat(format)
      : undefined;

    options.outputFormat = imageFormat;

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

    if (this.isImageFormat(format)) {
      buttons.push(
        <SaveButton
          mode="saveImage"
          options={options}
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
            filename + (currentFormatProperties?.extensions[0] || '')
          }
          key="save-file-button"
          type={currentFormatProperties?.mime}
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
        testId="save-structure-dialog"
        className={classes.dialog}
        title="Save Structure"
        params={this.props}
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

const mapDispatchToProps = (dispatch: DispatchProp) => ({
  onCheck: (checkOptions: unknown) => dispatch(check(checkOptions)),
  onTmplSave: (struct: Struct) => dispatch(saveUserTmpl(struct)),
  onResetForm: (prevState: FormState) => dispatch(updateFormState(prevState)),
});

const Save = connect(mapStateToProps, mapDispatchToProps)(SaveDialog);

export default Save;
