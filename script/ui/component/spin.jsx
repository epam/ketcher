import { h, Component } from 'preact';
/** @jsx h */

function Spin({...props}) {
	return (
		<div className="spin" {...props}></div>
	);
}

export default Spin;
