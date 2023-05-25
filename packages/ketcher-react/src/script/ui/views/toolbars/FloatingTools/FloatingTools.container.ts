import { connect } from 'react-redux'
import { Dispatch } from 'redux'
import {
  getFloatingToolsHandlePos,
  getFloatingToolsVisible
} from 'src/script/ui/state/floatingTools/selectors'
import { onAction } from '../../../state'
import {
  FloatingTools,
  type FloatingToolsCallProps,
  type FloatingToolsProps
} from './FloatingTools'

const mapStateToProps = (state: any): FloatingToolsProps => {
  return {
    visible: getFloatingToolsVisible(state),
    HandlePos: getFloatingToolsHandlePos(state),
    status: state.actionState || {},
    indigoVerification: state.requestsStatuses.indigoVerification
  }
}

const mapDispatchToProps = (dispatch: Dispatch): FloatingToolsCallProps => ({
  onAction: (action) => dispatch(onAction(action))
})

const FloatingToolContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FloatingTools)

export { FloatingToolContainer }
