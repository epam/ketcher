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

import * as KN from 'w3c-keyname';

import {
  FC,
  PropsWithChildren,
  ReactElement,
  useLayoutEffect,
  useRef,
} from 'react';

import clsx from 'clsx';
import { Icon } from 'components';
import styles from './Dialog.module.less';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants';
import { CLIP_AREA_BASE_CLASS } from '../../../component/cliparea/cliparea';

interface DialogParamsCallProps {
  onCancel: () => void;
  onOk: (result: any) => void;
}

export interface DialogParams extends DialogParamsCallProps {
  className?: string;
}

interface DialogProps {
  title?: string;
  params: DialogParams;
  buttons?: Array<string | ReactElement>;
  className?: string;
  needMargin?: boolean;
  withDivider?: boolean;
  headerContent?: ReactElement;
  footerContent?: ReactElement;
  buttonsNameMap?: {
    [key in string]: string;
  };
  focusable?: boolean;
}

interface DialogCallProps {
  result?: () => any;
  valid?: () => boolean;
}

type Props = DialogProps & DialogCallProps;

const Dialog: FC<PropsWithChildren & Props> = (props) => {
  const {
    children,
    title,
    params,
    result = () => null,
    valid = () => !!result(),
    buttons = ['OK'],
    headerContent,
    footerContent,
    className,
    buttonsNameMap,
    needMargin = true,
    withDivider = false,
    focusable = true,
    ...rest
  } = props;
  const dialogRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (focusable) {
      (dialogRef.current as HTMLElement).focus();
    }

    return () => {
      (
        dialogRef.current
          ?.closest(KETCHER_ROOT_NODE_CSS_SELECTOR)
          ?.getElementsByClassName(CLIP_AREA_BASE_CLASS)[0] as HTMLElement
      ).focus();
    };
  }, [focusable]);

  const isButtonOk = (button) => {
    return button === 'OK' || button === 'Save';
  };

  const exit = (mode) => {
    const key = isButtonOk(mode) ? 'onOk' : 'onCancel';
    if (params && key in params && (key !== 'onOk' || valid())) {
      params[key](result());
    }
  };

  const keyDown = (event) => {
    const key = KN.keyName(event);
    const active = document.activeElement;
    const activeTextarea = active && active.tagName === 'TEXTAREA';
    if (key === 'Escape' || (key === 'Enter' && !activeTextarea)) {
      exit(key === 'Enter' ? 'OK' : 'Cancel');
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      onSubmit={(event) => event.preventDefault()}
      onKeyDown={keyDown}
      tabIndex={-1}
      className={clsx(styles.dialog, className, params.className)}
      {...rest}
    >
      <header
        className={clsx(styles.header, withDivider && styles.withDivider)}
      >
        {headerContent || <span>{title}</span>}
        <div className={styles.btnContainer}>
          <button className={styles.buttonTop} onClick={() => exit('Cancel')}>
            <Icon name={'close'} className={styles.closeButton} />
          </button>
        </div>
      </header>
      <div className={clsx(styles.body, needMargin && styles.withMargin)}>
        {children}
      </div>

      {(footerContent || buttons.length > 0) && (
        <footer className={styles.footer}>
          {footerContent}
          {buttons.length > 0 &&
            buttons.map((button) =>
              typeof button !== 'string' ? (
                button
              ) : (
                <input
                  key={button}
                  type="button"
                  className={clsx(
                    isButtonOk(button) ? styles.ok : styles.cancel,
                    button === 'Save' && styles.save,
                  )}
                  value={
                    buttonsNameMap && buttonsNameMap[button]
                      ? buttonsNameMap[button]
                      : button
                  }
                  disabled={isButtonOk(button) && !valid()}
                  onClick={() => exit(button)}
                  data-testid={button}
                />
              ),
            )}
        </footer>
      )}
    </div>
  );
};

export default Dialog;
