/****************************************************************************
 * Copyright 2018 EPAM Systems
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

import { h, Component } from 'preact';

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
		const { children, captions, ...props } = this.props;
		return (
			<ul {...props}>
				<li className="tabs">
					{ captions.map((caption, index) => (
						<a // eslint-disable-line
							className={this.state.tabIndex === index ? 'active' : ''}
							onClick={ev => this.changeTab(ev, index)}
						>
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
