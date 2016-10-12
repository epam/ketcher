import {h, Component} from 'preact';
/** @jsx h */

class Tabs extends Component {
	constructor(props) {
		super(props);
		this.state.tabIndex = 0;
	}
	changeTab(ev, index) {
		this.setState({	tabIndex: index });
		if (this.props.changeTab) this.props.changeTab(index);
	}

	render() {
		let {children, captions, ...props} = this.props;
		return (
			<div {...props}>
				<ul className="tabs">
					{ captions.map((caption, index) => (
						<li className={this.state.tabIndex == index ? 'active' : ''}
							 onClick={ ev => this.changeTab(ev, index)}>
							{caption}
						</li>
					)) }
				</ul>
				<div className="tabs-content">
					{ children[this.state.tabIndex] }
				</div>
			</div>
		);
	}
}

export default Tabs;
