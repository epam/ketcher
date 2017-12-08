import { h, Component } from 'preact';
import { connect } from 'preact-redux';

class MeasureLog extends Component {
	componentWillReceiveProps(props, oldProps) {
		if (!oldProps.editor && props.editor) {
			props.editor.event.message.add((msg) => {
				if (msg.info) {
					this.base.innerHTML = msg.info;
					this.base.classList.add('visible');
				} else {
					this.base.classList.remove('visible');
				}
			});
		}
	}
	render() {
		return (
			<div className="measure-log" />
		);
	}
}
export default connect(
	state => ({
		editor: state.editor
	})
)(MeasureLog);
