function EditorTool(editor) {
	this.editor = editor;
}

EditorTool.prototype.OnMouseDown = function () {};
EditorTool.prototype.OnMouseMove = function () {};
EditorTool.prototype.OnMouseUp = function () {};
EditorTool.prototype.OnClick = function () {};
EditorTool.prototype.OnDblClick = function () {};
EditorTool.prototype.OnMouseLeave = function () {
	this.OnCancel(); // eslint-disable-line new-cap
};
EditorTool.prototype.OnCancel = function () {}; // called when we abandon the tool

EditorTool.prototype.OnMouseDown0 = function (event) {
	this.OnMouseDown0.lastEvent = event;
	this.OnMouseMove0.lastEvent = event;
	return this.OnMouseDown(event); // eslint-disable-line new-cap
};

EditorTool.prototype.OnMouseMove0 = function (event) {
	this.OnMouseMove0.lastEvent = event;
	return this.OnMouseMove(event); // eslint-disable-line new-cap
};

EditorTool.prototype.OnMouseUp0 = function (event) {
	// here we suppress event we got when second touch released in guesture
	if (!('lastEvent' in this.OnMouseDown0))
		return true;

	if ('lastEvent' in this.OnMouseMove0) {
		// this data is missing for 'touchend' event when last finger is out
		event = Object.clone(event); // pageX & pageY properties are readonly in Opera
		event.pageX = this.OnMouseMove0.lastEvent.pageX;
		event.pageY = this.OnMouseMove0.lastEvent.pageY;
	}
	return this.OnMouseUp(event); // eslint-disable-line new-cap
};

module.exports = EditorTool;
