import {h, Component} from 'preact';
/** @jsx h */

class Accordion extends Component {
	constructor(props) {
		super(props);
		this.state.active = props.active ? props.active : {};
	}
	onActive(index) {
		let newActive = {};
		newActive[index] = !this.state.active[index];
		this.setState({ active: Object.assign(this.state.active, newActive)});
		if (this.props.onActive) this.props.onActive();
	}

	render() {
		let {children, captions, ...props} = this.props;
		return (
			<ul {...props}>
				{ captions.map((caption, index) => (
					<li className="tab">
						<a className={this.state.active[index]  ? 'active' : ''}
							onClick={() => this.onActive(index)}>
							{caption}
						</a>
						{this.state.active[index] ? children[index] : null }
					</li>
				)) }
			</ul>
		);
	}
}

export default Accordion;
