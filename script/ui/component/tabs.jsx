/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import {h, Component} from 'preact';
/** @jsx h */

class Tabs extends Component {
	constructor(props) {
		super(props);
		this.state.tabIndex = props.tabIndex || 0;
		this.props.changeTab(this.state.tabIndex);
	}

	changeTab(ev, index) {
		this.setState({ tabIndex: index });
		if (this.props.changeTab)
			this.props.changeTab(index);
	}

	render() {
		const {children, captions, ...props} = this.props;
		return (
			<ul {...props}>
				<li className="tabs">
					{ captions.map((caption, index) => (
						<a className={this.state.tabIndex === index ? 'active' : ''}
							 onClick={ ev => this.changeTab(ev, index)}>
							{caption}
						</a>
					)) }
				</li>
				<li className="tabs-content">
					{ children[this.state.tabIndex] }
				</li>
			</ul>
		);
	}
}

export default Tabs;
