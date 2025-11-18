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

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  changeImage,
  changeVersion,
  shouldFragment,
} from '../../../../../state/options';

import { Dialog } from '../../../../components';
import Input from '../../../../../component/form/Input/Input';
import OpenButton from '../../../../../component/view/openbutton';
import { LoadingCircles } from 'src/script/ui/views/components/Spinner';
import classes from './Recognize.module.less';
import { connect } from 'react-redux';
import { load } from '../../../../../state';
import { range } from 'lodash/fp';
import { recognize } from '../../../../../state/server';
import { DialogActionButton } from 'src/script/ui/views/modal/components/document/Open/components/DialogActionButton';
import { Icon, StructRender } from 'components';
import { ketcherProvider, Struct } from 'ketcher-core';
import { useAppContext } from 'src/hooks';

function isImage(file: File | null): boolean {
  return file?.type?.includes('image') ?? false;
}

interface FooterContentProps {
  onImage: (file: File | null) => void;
  structStr: string | Promise<unknown> | null;
  openHandler: () => void;
  copyHandler: () => void;
  isAddToCanvasDisabled: boolean;
}

function FooterContent({
  onImage,
  structStr,
  openHandler,
  copyHandler,
  isAddToCanvasDisabled,
}: FooterContentProps) {
  return (
    <div className={classes.footerContent}>
      <OpenButton
        key="choose"
        onLoad={onImage}
        type="image/*"
        className={classes.openButton}
      >
        <Icon name="open" />
        <span>Change image</span>
      </OpenButton>
      <div>
        <DialogActionButton
          key="openButton"
          disabled={!structStr}
          clickHandler={openHandler}
          styles={classes.secondaryButton}
          label="Open as new Project"
        />
        <DialogActionButton
          key="copyButton"
          disabled={!structStr || isAddToCanvasDisabled}
          clickHandler={copyHandler}
          styles={classes.primaryButton}
          label="Add to Canvas"
          title="Structure will be loaded as fragment and added to Clipboard"
        />
      </div>
    </div>
  );
}

interface RecognizeDialogProps {
  file: File | null;
  structStr: string | Promise<unknown> | null;
  fragment: boolean;
  version: string;
  imagoVersions: string[];
  onOk: (result: unknown) => void;
  onCancel: () => void;
  onRecognize: (file: File | null, version: string) => void;
  isFragment: (v: boolean) => void;
  onImage: (file: File | null) => void;
  onChangeImago: (version: string) => void;
}

function RecognizeDialog(prop: RecognizeDialogProps) {
  const {
    file,
    structStr,
    fragment,
    version,
    imagoVersions,
    onOk,
    ...partProps
  } = prop;
  const {
    onRecognize,
    /* eslint-disable @typescript-eslint/no-unused-vars */
    isFragment,
    /* eslint-enable @typescript-eslint/no-unused-vars */
    onImage,
    onChangeImago,
    ...props
  } = partProps;
  const [canPreviewImage, setCanPreviewImage] = useState(true);
  const result = () =>
    structStr && !(structStr instanceof Promise)
      ? { structStr, fragment }
      : null;
  const { ketcherId } = useAppContext();
  const ketcher = useMemo(
    () => ketcherProvider.getKetcher(ketcherId),
    [ketcherId],
  );

  useEffect(() => {
    onRecognize(file, version);
  }, [file, version, onRecognize]);

  const clearFile = useCallback(() => {
    onImage(null);
    return true;
  }, [onImage]);

  const copyHandler = () => {
    onOk({ structStr: structStr as string, fragment: true });
  };

  const openHandler = () => {
    onOk({ structStr: structStr as string, fragment: false });
  };

  return (
    <Dialog
      title="Import Structure from Image"
      className={classes.recognize}
      params={{ ...props, onOk }}
      result={result}
      withDivider={true}
      needMargin={false}
      footerContent={
        <FooterContent
          onImage={onImage}
          openHandler={openHandler}
          structStr={structStr}
          copyHandler={copyHandler}
          isAddToCanvasDisabled={
            ketcher.editor.render.options.viewOnlyMode ?? false
          }
        />
      }
      buttons={[]}
    >
      <div className={classes.topBody}>
        <label className={classes.imagoVersion}>
          {/* eslint-disable jsx-a11y/label-has-associated-control */}
          Imago version
          <Input
            type="text"
            schema={{
              enum: imagoVersions,
              enumNames: range(1, imagoVersions.length + 1).map(
                (i) => `Version ${i}`,
              ),
            }}
            value={version}
            onChange={onChangeImago}
          />
          {/* eslint-enable jsx-a11y/label-has-associated-control */}
        </label>
        <span>Original image</span>
        <span>Recognized structure preview</span>
      </div>

      <div className={classes.imagesContainer}>
        <div className={classes.picture}>
          {file && isImage(file) && canPreviewImage && (
            <img
              alt=""
              id="pic"
              src={url(file) ?? ''}
              onError={() => {
                setCanPreviewImage(false);
              }}
            />
          )}
          <span className={classes.filename}> {file ? file.name : null} </span>
          {file && isImage(file) && !canPreviewImage && (
            <div className={classes.messageContainer}>
              <p>
                Preview of '{file.type}' MIME type is not supported by current
                browser
              </p>
            </div>
          )}
          {(!file || (!isImage(file) && clearFile())) && (
            <div className={classes.messageContainer}>
              <p>Please choose image</p>
            </div>
          )}
        </div>
        <div className={classes.output}>
          {structStr &&
            // in Edge 38: instanceof Promise always `false`
            (structStr instanceof Promise || typeof structStr !== 'string' ? (
              <div className={classes.messageContainer}>
                <LoadingCircles />
              </div>
            ) : (
              <StructRender
                className={classes.struct}
                struct={structStr as unknown as Struct}
              />
            ))}
        </div>
      </div>
    </Dialog>
  );
}

function url(file: File | null): string | null {
  if (!file) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const URL = window.URL || (window as any).webkitURL;
  return URL ? URL.createObjectURL(file) : 'No preview';
}

interface RecognizeState {
  options: {
    app: {
      imagoVersions: string[];
    };
    recognize: {
      file: File | null;
      structStr: string | Promise<unknown> | null;
      fragment: boolean;
      version: string | null;
    };
  };
}

const mapStateToProps = (state: RecognizeState) => ({
  imagoVersions: state.options.app.imagoVersions,
  file: state.options.recognize.file,
  structStr: state.options.recognize.structStr,
  fragment: state.options.recognize.fragment,
  version:
    state.options.recognize.version ?? state.options.app.imagoVersions[1],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDispatchToProps = (dispatch: any) => ({
  isFragment: (v: boolean) => dispatch(shouldFragment(v)),
  onImage: (file: File | null) => dispatch(changeImage(file)),
  onRecognize: (file: File | null, ver: string) =>
    dispatch(recognize(file, ver)),
  onChangeImago: (ver: string) => dispatch(changeVersion(ver)),
  onOk: (result: unknown) => {
    const res = result as { structStr: string; fragment: boolean };
    dispatch(
      load(res.structStr as unknown as Struct, {
        rescale: true,
        fragment: res.fragment,
      }),
      // TODO: Removed ownProps.onOk call. consider refactoring of load function in release 2.4
      // See PR #731 (https://github.com/epam/ketcher/pull/731)
    );
  },
});

const Recognize = connect(mapStateToProps, mapDispatchToProps)(RecognizeDialog);

export default Recognize;
