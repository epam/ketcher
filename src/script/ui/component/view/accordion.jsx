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
import { xor } from 'lodash/fp';

class Accordion extends Component {
	constructor(props) {
		super(props);
		this.state.active = props.active || [];
	}
	onActive(index) {
		const { multiple = true } = this.props;

		if (!multiple)
			this.setState({ active: [index] });
		else
			this.setState({ active: xor(this.state.active, [index]) });
	}

	render() {
		const { children, captions, ...props } = this.props;
		const { active } = this.state;
		return (
			<ul {...props}>
				{ captions.map((caption, index) => (
					<li className={'ac_tab ' + (active.includes(index) ? 'active' : 'hidden')}>
						<a // eslint-disable-line
							onClick={() => this.onActive(index)}
						>
							{caption}
						</a>
						{children[index]}
					</li>
				)) }
			</ul>
		);
	}
}

export default Accordion;
