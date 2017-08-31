import { h } from 'preact';
/** @jsx h */

function Spin({...props}) {
	return (
		<div className="spinner" {...props}></div>
	);
}

export default Spin;
