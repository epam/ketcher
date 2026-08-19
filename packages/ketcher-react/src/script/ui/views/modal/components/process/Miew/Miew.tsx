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
  type ComponentType,
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';
import { Dialog, LoadingCircles } from '../../../../components';
import {
  type Struct,
  type StructService,
  FormatterFactory,
  KetcherLogger,
  ketcherProvider,
  SupportedFormat,
} from 'ketcher-core';
import { MIEW_OPTIONS } from '../../../../../data/schema/options-schema';
import classes from './Miew.module.less';
import { connect } from 'react-redux';
import { load, parseStruct } from '../../../../../state/shared';
import { pick } from 'lodash/fp';
import type { Miew as MiewAsType } from 'miew';
import { createSelector } from 'reselect';
import { useAppContext } from 'src/hooks';
import {
  alignToCentroid,
  mergeMetaObjects,
  needsMetaPreservation,
} from './miewStructMerge';

const Viewer = lazy(() =>
  import('miew-react').then((module) => ({
    default: module.default as unknown as ComponentType<any>,
  })),
);

type MiewDialogProps = {
  miewOpts: any;
  server: StructService;
  struct: Struct;
  onCancel: () => void;
  onOk: (result: any) => void;
  miewTheme: 'dark' | 'light';
};
type MiewDialogCallProps = {
  dispatch: ThunkDispatch<unknown, undefined, AnyAction>;
  serverSettings: Record<string, unknown>;
};
type Props = MiewDialogProps & MiewDialogCallProps;

/* OPTIONS for MIEW */
const BACKGROUND_COLOR = {
  dark: '0x202020',
  light: '0xcccccc',
};

const MIEW_TX_TYPES = {
  no: null,
  bright: {
    colorer: 'EL',
  },
  blackAndWhite: {
    colorer: ['UN', { color: 0xffffff }],
    bg: '0x000',
  },
  black: {
    colorer: ['UN', { color: 0x000000 }],
  },
};

const TXoptions = (userOpts) => {
  const type = userOpts.miewAtomLabel;
  if (MIEW_TX_TYPES[type] === null) return null;
  return {
    colorer: MIEW_TX_TYPES[type].colorer,
    selector: 'not elem C',
    mode: [
      'TX',
      {
        bg: MIEW_TX_TYPES[type].bg || BACKGROUND_COLOR[userOpts.miewTheme],
        showBg: true,
        template: '{{elem}}',
      },
    ],
  };
};

function createMiewOptions(userOpts) {
  const options = {
    settings: {
      bg: { color: Number(BACKGROUND_COLOR[userOpts.miewTheme]) },
      autoPreset: false,
      editing: true,
      inversePanning: true,
    },
    reps: [
      {
        mode: userOpts.miewMode,
      },
    ],
  };

  const textMode = TXoptions(userOpts);
  if (textMode) options.reps.push(textMode);

  return options;
}
/* ---------------- */
const CHANGING_WARNING =
  'Stereocenters can be changed after the strong 3D rotation';

const FooterContent = () => (
  <div className={classes.warning}>{CHANGING_WARNING}</div>
);

const MiewDialog = ({
  miewOpts,
  server,
  struct,
  dispatch,
  serverSettings,
  miewTheme = 'light',
  ...prop
}: Props) => {
  const miewRef = useRef<MiewAsType>(undefined);
  const [isInitialized, setIsInitialized] = useState(false);
  const { ketcherId } = useAppContext();
  const ketcher = useMemo(
    () => ketcherProvider.getKetcher(ketcherId),
    [ketcherId],
  );

  const isDisabled = useMemo(() => {
    return (
      !isInitialized || ketcher?.editor.render.options.viewOnlyMode === true
    );
  }, [ketcher, isInitialized]);

  const onMiewInit = useCallback(
    (miew: MiewAsType) => {
      miewRef.current = miew;
      const factory = new FormatterFactory(server);
      const service = factory.create(SupportedFormat.cml);
      const moleculeOnlyStruct = struct.clone(null, null, true);

      service
        .getStringFromStructureAsync(moleculeOnlyStruct)
        .then((res) =>
          miew.load(res, { sourceType: 'immediate', fileType: 'cml' }),
        )
        .then(() => {
          miew.setOptions(miewOpts);
          setIsInitialized(true);
        })
        .catch((e) => {
          KetcherLogger.error('Miew.tsx::MiewDialog::onMiewInit', e);
        });
    },
    [miewOpts, server, struct],
  );

  const exportCML = useCallback(async () => {
    const cmlStruct = miewRef.current?.exportCML();
    if (!cmlStruct) {
      return;
    }

    if (!needsMetaPreservation(struct)) {
      dispatch(load(cmlStruct));
      return;
    }

    try {
      const result = await parseStruct(cmlStruct, server, serverSettings);
      result.rescale();
      alignToCentroid(result, struct);
      mergeMetaObjects(result, struct);
      dispatch(load(result, { preserveViewport: true, skipCenter: true }));
    } catch (e) {
      KetcherLogger.error('Miew.tsx::MiewDialog::exportCML', e);
    }
  }, [dispatch, server, serverSettings, struct]);

  return (
    <Dialog
      title="Miew"
      needMargin={false}
      params={prop}
      buttons={[
        'Cancel',
        <button
          key="apply"
          onClick={exportCML}
          className={classes.applyButton}
          disabled={isDisabled}
          data-testid="miew-modal-button"
        >
          Apply
        </button>,
      ]}
      footerContent={<FooterContent />}
      className={classes.miewDialog}
    >
      <div>
        <div
          className={`${classes.miewContainer} ${
            miewTheme === 'dark' ? classes.miewDarkTheme : ''
          }`}
        >
          <Suspense
            fallback={
              <div className={classes.loadingContainer}>
                <LoadingCircles />
              </div>
            }
          >
            <Viewer onInit={onMiewInit} />
          </Suspense>
        </div>
      </div>
    </Dialog>
  );
};

const getOptionsSettings = (state) => state.options.settings;
const miewOptionsSelector = createSelector([getOptionsSettings], (settings) =>
  createMiewOptions(pick(MIEW_OPTIONS, settings)),
);

const mapStateToProps = (state) => ({
  miewOpts: miewOptionsSelector(state),
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  miewTheme: state.options.settings.miewTheme,
  serverSettings: state.options.getServerSettings(),
});

const mapDispatchToProps = (dispatch) => ({
  dispatch,
});

const Miew = connect(mapStateToProps, mapDispatchToProps)(MiewDialog);

export default Miew;
