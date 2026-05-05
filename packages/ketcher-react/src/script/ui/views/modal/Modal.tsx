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

import { useRef } from 'react';

import { BaseCallProps, ModalContainerProps } from './modal.types';
import classes from './Modal.module.less';
import selectClasses from '../../component/form/Select/Select.module.less';
import clsx from 'clsx';
import mediaSizes from './mediaSizes';
import modals from '../../dialog';
import useResizeObserver from 'use-resize-observer/polyfilled';

interface ModalProps extends BaseCallProps {
  modal: {
    name: string;
    form: any;
    prop: any;
  };
}

type Props = ModalProps & BaseCallProps & ModalContainerProps;

type ModalContentProps = Omit<Props, 'modal'> & {
  modal: NonNullable<Props['modal']>;
};

function ModalContent({ modal, ...rest }: ModalContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { height, width } = useResizeObserver<HTMLDivElement>({
    ref: containerRef,
  });

  const Component = modals[modal.name];

  if (!Component)
    throw new Error(`There is no modal window named ${modal.name}`);

  return (
    <div
      className={clsx(classes.modalOverlay, selectClasses.selectContainer)}
      ref={containerRef}
      data-testid={`${modal.name}-dialog`}
    >
      <Component
        className={clsx({
          [classes.smallScreen]:
            (height && height <= mediaSizes.smallHeight) ||
            (width && width <= mediaSizes.smallWidth),
        })}
        {...rest}
      />
    </div>
  );
}

function Modal(props: Props) {
  const { modal, ...rest } = props;

  if (!modal) return null;

  return <ModalContent modal={modal} {...rest} />;
}

export type { ModalProps };
export { Modal };
