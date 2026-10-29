/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useEffect, useRef } from 'react';

import type {
  BaseCallProperties,
  ModalContainerProperties,
} from './modal.types';
import classes from './Modal.module.less';
import selectClasses from '../../component/form/Select/Select.module.less';
import clsx from 'clsx';
import mediaSizes from './mediaSizes';
import modals from '../../dialog';
import useResizeObserver from 'use-resize-observer/polyfilled';
import { ketcherProvider } from 'ketcher-core';
import type Editor from '../../../editor';
import type { ModalState } from '../../state/modal';

interface ModalProperties extends BaseCallProperties {
  modal: Pick<ModalState, 'name' | 'form' | 'prop'>;
}

type Properties = ModalProperties &
  BaseCallProperties &
  ModalContainerProperties;

type ModalContentProperties = Omit<Properties, 'modal'> & {
  modal: NonNullable<Properties['modal']>;
};

function ModalContent({ modal, ketcherId, ...rest }: ModalContentProperties) {
  const containerReference = useRef<HTMLDivElement>(null);
  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: containerReference as React.RefObject<HTMLDivElement>,
  });

  const Component = modals[modal.name];

  useEffect(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

    return () => {
      setTimeout(() => editor.focusCliparea(), 0);
    };
  }, [ketcherId]);

  if (!Component)
    throw new Error(`There is no modal window named ${modal.name}`);

  return (
    <div
      className={clsx(classes.modalOverlay, selectClasses.selectContainer)}
      ref={containerReference}
      data-testid={`${modal.name}-dialog`}
    >
      <Component
        className={clsx({
          [classes.smallScreen]:
            (height && height <= mediaSizes.smallHeight) ||
            (width && width <= mediaSizes.smallWidth),
        })}
        ketcherId={ketcherId}
        {...rest}
      />
    </div>
  );
}

function Modal(properties: Properties) {
  const { modal, ...rest } = properties;

  if (!modal) return null;

  return <ModalContent modal={modal} {...rest} />;
}

export type { ModalProperties };
export { Modal };
