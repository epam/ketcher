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
  type FloatingToolsCallProps,
  type FloatingToolsProps,
} from './FloatingTools';

type State = {
  floatingTools: FloatingToolsState;
  actionState?: FloatingToolsProps['status'];
  requestsStatuses: Pick<RequestState, 'indigoVerification'>;
};

const mapStateToProps = (state: State): FloatingToolsProps => {
  return {
    visible: getFloatingToolsVisible(state),
    rotateHandlePosition: getFloatingToolsRotateHandlePosition(state),
    status: state.actionState ?? {},
    indigoVerification: state.requestsStatuses.indigoVerification,
  };
};

const mapDispatchToProps = (dispatch: Dispatch): FloatingToolsCallProps => ({
  onAction: (action) => dispatch(onAction(action)),
});

const FloatingToolContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FloatingTools);

export { FloatingToolContainer };
