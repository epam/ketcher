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
/** @jsx h */

const STYLE_INNER = 'position:relative; overflow:hidden; width:100%; min-height:100%;';

const STYLE_CONTENT = 'position:absolute; top:0; left:0; height:100%; width:100%; overflow:visible;';

export default class VirtualList extends Component {
	constructor(props) {
		super(props);
		this.state = {
			offset: 0,
			height: 0
		};
	}

	resize = (ev, reset) => {
		const height = this.base.offsetHeight;

		if (this.state.height !== height)
			this.setState({ height });

		if (reset) {
			this.setState({ offset: 0 });
			this.base.scrollTop = 0;
		}
	};

	handleScroll = () => {
		this.setState({ offset: this.base.scrollTop });
		if (this.props.sync) this.forceUpdate();
	};

	componentDidUpdate({ data }) {
		const equal = (data.length === this.props.data.length &&
			this.props.data.every((v, i) => v === data[i]));

		this.resize(null, !equal);
	}

	componentDidMount() {
		this.resize();
		addEventListener('resize', this.resize); // eslint-disable-line
	}

	componentWillUnmount() {
		removeEventListener('resize', this.resize); // eslint-disable-line
	}

	render() {
		const { data, rowHeight, children, Tag = 'div', overscanCount = 1, sync, ...props } = this.props;
		const { offset, height } = this.state;

		// first visible row index
		let start = (offset / rowHeight) || 0;
		const renderRow = children[0];

		// actual number of visible rows (without overscan)
		let visibleRowCount = (height / rowHeight) || 0;

		// Overscan: render blocks of rows modulo an overscan row count
		// This dramatically reduces DOM writes during scrolling
		if (overscanCount) {
			start = Math.max(0, start - (start % overscanCount));
			visibleRowCount += overscanCount;
		}

		// last visible + overscan row index
		const end = start + 1 + visibleRowCount;

		// data slice currently in viewport plus overscan items
		const selection = data.slice(start, end);

		return (
			<div onScroll={this.handleScroll} {...props}>
				<div style={`${STYLE_INNER} height:${data.length * rowHeight}px;`}>
					<Tag style={`${STYLE_CONTENT} top:${start * rowHeight}px;`}>
						{ selection.map((d, i) => renderRow(d, start + i)) }
					</Tag>
				</div>
			</div>
		);
	}
}
