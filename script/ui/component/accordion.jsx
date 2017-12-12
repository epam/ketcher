/****************************************************************************
 * Copyright 2017 EPAM Systems
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

class Accordion extends Component {
	constructor(props) {
		super(props);
		this.state.active = props.active ? props.active : {};
	}
	onActive(index) {
		const newActive = {};
		newActive[index] = !this.state.active[index];
		this.setState({ active: Object.assign(this.state.active, newActive) });
		if (this.props.onActive) this.props.onActive();
	}

	render() {
		const { children, captions, ...props } = this.props;
		return (
			<ul {...props}>
				{ captions.map((caption, index) => (
					<li className="tab">
						<a // eslint-disable-line
							className={this.state.active[index] ? 'active' : ''}
							onClick={() => this.onActive(index)}
						>
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
