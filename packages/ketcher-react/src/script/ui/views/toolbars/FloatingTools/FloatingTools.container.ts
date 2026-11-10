import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import {
  getFloatingToolsRotateHandlePosition,
  getFloatingToolsVisible,
} from 'src/script/ui/state/floatingTools/selectors';
import { onAction } from '../../../state';
import type { FloatingToolsState } from '../../../state/floatingTools';
import type { RequestState } from '../../../state/request/request.types';
import {
  FloatingTools,
  type FloatingToolsCallProperties,
  type FloatingToolsProperties,
} from './FloatingTools';

type State = {
  floatingTools: FloatingToolsState;
  actionState?: FloatingToolsProperties['status'];
  requestsStatuses: Pick<RequestState, 'indigoVerification'>;
};

const mapStateToProperties = (state: State): FloatingToolsProperties => {
  return {
    visible: getFloatingToolsVisible(state),
    rotateHandlePosition: getFloatingToolsRotateHandlePosition(state),
    status: state.actionState ?? {},
    indigoVerification: state.requestsStatuses.indigoVerification,
  };
};

const mapDispatchToProperties = (
  dispatch: Dispatch,
): FloatingToolsCallProperties => ({
  onAction: (action) => dispatch(onAction(action)),
});

const FloatingToolContainer = connect(
  mapStateToProperties,
  mapDispatchToProperties,
)(FloatingTools);

export { FloatingToolContainer };
