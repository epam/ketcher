import { h } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import { setStruct, changeImage, shouldFragment } from '../state/options';
import Dialog from '../component/dialog';
import Input from '../component/input';
import StructRender from '../component/structrender';
import Spin from '../component/spin';

function recognize(server, file, dispatch) {
	var process = server.recognize(file).then(res => {
		dispatch(setStruct(res.struct));
	}, err => {
		dispatch(setStruct(null));
		setTimeout(() => alert("Error! The picture isn't recognized.") , 200); // TODO: remove me...
	});
	dispatch(setStruct(process));
}

function Recognize(prop) {
	let {file, structStr, fragment, dispatch, ...props} = prop;

	const result = () =>
		structStr && !(structStr instanceof Promise) ? {structStr, fragment} : null;

	return (
		<Dialog title="Import From Image" className="recognize"
				params={props} result={() => result(structStr, fragment) }
				buttons={[
					(
						<label className="open">
							Choose file…
							<input type="file" onChange={ (ev) => dispatch(changeImage(ev.target.files[0])) }
								   accept="image/*"/>
						</label>
					),
					<span className="open-filename">{file ? file.name : null}</span>,
					file && !structStr ? (
						<button onClick={() => recognize(props.server, file, dispatch) }>Recognize</button>
					) : null,
					"Cancel",
					"OK"
				]}>
			<div className="picture">
				{
					file ? (
						<img id="pic" src={url(file) || ""}
							 onError={() => {
								 dispatch(changeImage(null));
								 alert("Error, it isn't a picture");
							 }}/>
					) : null
				}
			</div>
			<div className="output">
				{
					structStr ? (
						structStr instanceof Promise ?
							( <Spin/> ) :
							( <StructRender className="struct" struct={structStr}/> )
					) : null
				}
			</div>
			<label>
				<Input type="checkbox" value={fragment} onChange={v => dispatch(shouldFragment(v))}/>
				Load as a fragment
			</label>
		</Dialog>
	);
}

function url(file) {
	if (!file) return null;
	var URL = window.URL || window.webkitURL;
	return URL ? URL.createObjectURL(file) : "No preview";
}

export default connect(store => {
	return {
		file: store.options.recognize.file,
		structStr: store.options.recognize.structStr,
		fragment: store.options.recognize.fragment
	};
})(Recognize);
