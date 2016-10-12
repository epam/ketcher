import {h, Component} from 'preact';
/** @jsx h */

class Accordion extends Component {
	constructor(props) {
		super(props);
		this.state.activeTabs = props.activeTabs;
	}
	changeActiveTabs(ev, caption) {
		let newState = this.state.activeTabs;
		let index = newState.indexOf(caption);
		if (index != -1) newState.splice(index, 1);
		else newState.push(caption);
		this.setState({ activeTabs: newState})
	}

	render() {
		let {children, captions, ...props} = this.props;
		return (
			<ul {...props}>
				{ captions.map((caption, index) => (
					<li className="tab">
						<div className={this.state.activeTabs.indexOf(caption) != -1 ? 'active' : ''}
							onClick={ ev => this.changeActiveTabs(ev, caption)}>
							{caption}
						</div>
						{ this.state.activeTabs.indexOf(caption) != -1 ? children[index] : null }
					</li>
				)) }
			</ul>
		);
	}
}

export default Accordion;
