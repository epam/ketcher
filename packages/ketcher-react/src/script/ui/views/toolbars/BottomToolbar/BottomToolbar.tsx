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

import type { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type ToolbarGroupItemCallProps,
  type ToolbarGroupItemProps,
  ToolbarGroupItem,
} from '../ToolbarGroupItem';

import { type TemplatesListProps, TemplatesList } from './TemplatesList';
import classes from './BottomToolbar.module.less';
import clsx from 'clsx';

const Group: FC<{ className?: string } & PropsWithChildren> = ({
  children,
  className,
}) => <div className={clsx(classes.group, className)}>{children}</div>;

interface BottomToolbarProps extends Omit<
  ToolbarGroupItemProps,
  'id' | 'options' | 'status'
> {
  className?: string;
  active?: TemplatesListProps['active'];
  status: TemplatesListProps['status'];
  templates: TemplatesListProps['templates'];
}

type BottomToolbarCallProps = ToolbarGroupItemCallProps;

type Props = BottomToolbarProps & BottomToolbarCallProps;

const BottomToolbar = (props: Props) => {
  const { className, templates, ...rest } = props;
  const { t } = useTranslation();

  return (
    <div data-testid="bottom-toolbar" className={clsx(classes.root, className)}>
      <Group>
        <div
          className={classes.templates}
          role="group"
          aria-label={t('dialogs:toolbox.templateAttach.templatesName')}
        >
          <TemplatesList {...rest} templates={templates} />
        </div>

        <ToolbarGroupItem id="template-lib" {...rest} />
      </Group>
    </div>
  );
};

export type { BottomToolbarProps, BottomToolbarCallProps };
export { BottomToolbar };
