function EnhancedStereoTool(editor) {
	if (!(this instanceof EnhancedStereoTool)) {


		const res = editor.event.enhancedStereoEdit.dispatch({
			data: 'EnhancedStereoTool send it'
		});

		Promise.resolve(res).then((data) => {
			console.log('EnhancedStereoTool got it:', data);
		});
	}
}

export default EnhancedStereoTool;
