import { h, Component } from 'preact';
/** @jsx h */

//import { Component, React } from 'react';

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

	resize = (reset) => {
		var height = this.base.offsetHeight;
		if (this.state.height !== height) {
			this.setState({ height });
		}
		if (reset) {
			this.setState({offset: 0});
			this.base.scrollTop = 0;
		}
	};

	handleScroll = () => {
		this.setState({ offset: this.base.scrollTop });
		if (this.props.sync) this.forceUpdate();
	};

	componentDidUpdate({data}) {
		var equal = (data.length == this.props.data.length &&
					 this.props.data.every((v,i)=> v === data[i]));
		this.resize(!equal);
	}

	componentDidMount() {
		this.resize();
		addEventListener('resize', this.resize);
	}

	componentWillUnmount() {
		removeEventListener('resize', this.resize);
	}

	render() {
		var { data, rowHeight, children, overscanCount=1, sync, ...props } = this.props;
		var { offset, height } = this.state;
		console.info('offset', offset);
		// first visible row index
		let start = (offset / rowHeight) || 0;
		let renderRow = children[0];

		// actual number of visible rows (without overscan)
		let visibleRowCount = (height / rowHeight) || 0;

		// Overscan: render blocks of rows modulo an overscan row count
		// This dramatically reduces DOM writes during scrolling
		if (overscanCount) {
			start = Math.max(0, start - (start % overscanCount));
			visibleRowCount += overscanCount;
		}

		// last visible + overscan row index
		let end = start + 1 + visibleRowCount;

		// data slice currently in viewport plus overscan items
		let selection = data.slice(start, end);

		return (
			<div class="outer" onScroll={this.handleScroll} {...props}>
				<div style={`${STYLE_INNER} height:${data.length*rowHeight}px;`}>
					<ul style={`${STYLE_CONTENT} top:${start*rowHeight}px;`}>
						{ selection.map((d, i) => renderRow(d, start + i)) }
					</ul>
				</div>
			</div>
		);
	}
}
