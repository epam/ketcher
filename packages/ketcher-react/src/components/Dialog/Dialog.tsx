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

import {
  type FC,
  type PropsWithChildren,
  type ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import styles from './Dialog.module.less';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants';
import { CLIP_AREA_BASE_CLASS } from '../../script/ui/component/cliparea/cliparea';
import { useSettingsPanelDrag } from '../../script/ui/views/modal/components/meta/Settings/useSettingsPanelDrag';

interface DialogParamsCallProps {
  onCancel?: () => void;
  onOk?: (result: unknown) => void;
}

export interface DialogParams extends DialogParamsCallProps {
  className?: string;
  isNestedModal?: boolean;
}

interface DialogProps {
  title?: string;
  params?: DialogParams;
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
  primaryButtons?: string[];
}

interface DialogCallProps {
  result?: () => unknown;
  valid?: () => boolean;
}

type Props = DialogProps & DialogCallProps;

export const Dialog: FC<PropsWithChildren & Props> = (props) => {
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
    primaryButtons,
    ...rest
  } = props;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation('common');
  // `button` values are also semantic identifiers (see isButtonOk/exit below)
  // and testids — only their *displayed* text is translated here, by default,
  // for the well-known tokens. Anything else (or a buttonsNameMap override)
  // is the caller's own text, untouched.
  const defaultButtonLabels: Record<string, string> = {
    OK: t('button.ok'),
    Cancel: t('button.cancel'),
    Save: t('button.save'),
  };

  // ---------------------------------------------------------------------------
  // Drag & resize — reuses useSettingsPanelDrag so the behaviour is identical
  // to the Settings floating panel. Enabled when the dialog is mounted inside a
  // [data-draggable="true"] overlay (set by Modal.tsx for opted-in dialogs).
  // parentElement check (not closest) so nested inline dialogs don't inherit it.
  // ---------------------------------------------------------------------------
  const [overlayElement, setOverlayElement] = useState<HTMLElement | null>(
    null,
  );

  useLayoutEffect(() => {
    const parent = dialogRef.current?.parentElement;
    setOverlayElement(parent instanceof HTMLElement ? parent : null);
  }, []);

  const isDraggable = overlayElement?.dataset?.draggable === 'true';

  const {
    rect,
    setRect,
    startDrag,
    startResizeTop,
    startResizeBottom,
    getBounds,
    setPreferredHeight,
  } = useSettingsPanelDrag({
    panelRef: dialogRef,
    boundsElement: isDraggable ? overlayElement : null,
    gutter: 0,
  });

  // Centre the dialog inside the overlay on first show. Fires when overlayElement
  // is detected (once per mount).
  useLayoutEffect(() => {
    if (!isDraggable) return;
    const dialog = dialogRef.current;
    const bounds = getBounds();
    if (!dialog || !bounds) return;

    const width = dialog.offsetWidth;
    const naturalHeight = dialog.scrollHeight;
    const height = Math.min(naturalHeight, bounds.bottom - bounds.top);

    setPreferredHeight(naturalHeight);
    setRect({
      left: bounds.left + (bounds.right - bounds.left - width) / 2,
      top: bounds.top + (bounds.bottom - bounds.top - height) / 2,
      width,
      height,
    });
    // Only re-run when the overlay element reference changes (i.e., on mount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayElement]);

  // Wrap startDrag to skip interactive elements inside the header.
  const handleHeaderPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (
        (e.target as Element).closest('button,input,select,a,[role="button"]')
      )
        return;
      startDrag(e);
    },
    [startDrag],
  );

  useLayoutEffect(() => {
    const dialogElement = dialogRef.current;

    // Use document.querySelector rather than dialogElement.closest() because
    // in popup mode the native <dialog> lives inside a MUI portal appended to
    // document.body — outside the .Ketcher-root subtree — so closest() returns
    // null and clipArea would be undefined.
    const clipArea = document.querySelector<HTMLElement>(
      `${KETCHER_ROOT_NODE_CSS_SELECTOR} .${CLIP_AREA_BASE_CLASS}`,
    );

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    if (focusable && dialogElement) {
      timeoutId = setTimeout(() => {
        dialogElement.focus();
      }, 0);
    }

    return () => {
      // Cancel the pending focus-on-open timeout so it cannot fire after
      // unmount and focus a detached element.
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      // Defer focus restoration so the browser can first move focus to
      // document.body naturally (when the <dialog> DOM node is removed).
      // That fires a native focusin on body which triggers MUI FocusTrap's
      // contain() with activeElement outside the trap, causing it to clear its
      // reactFocusEventTarget ref. If we focused clipArea synchronously here,
      // contain() would see focus is still inside the trap and short-circuit —
      // leaving reactFocusEventTarget pointing at the detached close button
      // (memory leak in popup mode).
      setTimeout(() => {
        clipArea?.focus();
      }, 0);
    };
  }, [focusable]);

  const isButtonOk = (button) => {
    return button === 'OK' || button === 'Save';
  };

  const isPrimary = (button) => {
    if (primaryButtons && primaryButtons.length > 0) {
      return primaryButtons.includes(button);
    }
    return isButtonOk(button);
  };

  const exit = (mode) => {
    const key = isButtonOk(mode) ? 'onOk' : 'onCancel';
    if (params && key in params && (key !== 'onOk' || valid())) {
      params[key]?.(result());
    }
  };

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      const isFocusInsideDialog = dialogRef.current?.contains(
        document.activeElement,
      );

      if (!isFocusInsideDialog) {
        return;
      }

      const { key } = event;
      const active = document.activeElement;
      const activeTextarea = active?.tagName === 'TEXTAREA';
      if (key === 'Escape' || (key === 'Enter' && !activeTextarea)) {
        exit(key === 'Enter' ? 'OK' : 'Cancel');
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener('keydown', keyDown);

    return () => {
      document.removeEventListener('keydown', keyDown);
    };
  });

  return (
    <dialog
      ref={dialogRef}
      open
      data-testid={'info-modal-window'}
      tabIndex={-1}
      className={clsx(styles.dialog, className, params?.className)}
      style={
        isDraggable
          ? rect
            ? {
                position: 'absolute',
                left: rect.left,
                top: rect.top,
                height: rect.height,
              }
            : { visibility: 'hidden' }
          : undefined
      }
      {...rest}
    >
      {isDraggable && (
        <div
          className={styles.resizeHandle}
          onPointerDown={startResizeTop}
          data-testid="dialog-resize-top"
        />
      )}
      <header
        className={clsx(
          styles.header,
          withDivider && styles.withDivider,
          isDraggable && styles.draggableHeader,
        )}
        onPointerDown={isDraggable ? handleHeaderPointerDown : undefined}
      >
        {headerContent || <span>{title}</span>}
        <div className={styles.btnContainer}>
          <button
            className={styles.buttonTop}
            onClick={() => exit('Cancel')}
            data-testid={'close-window-button'}
          >
            <Icon name={'close'} className={styles.closeButton} />
          </button>
        </div>
      </header>
      <div
        className={clsx(styles.body, needMargin && styles.withMargin)}
        data-testid={'info-modal-body'}
      >
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
                    isPrimary(button) ? styles.ok : styles.cancel,
                    button === 'Save' && styles.save,
                  )}
                  value={
                    buttonsNameMap?.[button] ??
                    defaultButtonLabels[button] ??
                    button
                  }
                  disabled={isButtonOk(button) && !valid()}
                  onClick={() => exit(button)}
                  data-testid={button}
                />
              ),
            )}
        </footer>
      )}
      {isDraggable && (
        <div
          className={styles.resizeHandle}
          onPointerDown={startResizeBottom}
          data-testid="dialog-resize-bottom"
        />
      )}
    </dialog>
  );
};
