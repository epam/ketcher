import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'

class MeasureLog extends Component {
  constructor(props) {
    super(props)
    this.logRef = createRef()
  }
  componentWillReceiveProps(props, oldProps) {
    if (!oldProps.editor && props.editor) {
      props.editor.event.message.add(msg => {
        const el = this.logRef.current
        if (msg.info) {
          const el = this.logRef.current
          el.innerHTML = msg.info
          el.classList.add('visible')
        } else {
          el.classList.remove('visible')
        }
      })
    }
  }
  render() {
    return <div className="measure-log" ref={this.logRef} />
  }
}
export default connect(state => ({
  editor: state.editor
}))(MeasureLog)
