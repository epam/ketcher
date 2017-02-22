function tfx(v) {
	return (v - 0).toFixed(8);
}

function relBox(box) {
	return {
		x: box.x,
		y: box.y,
		width: box.width,
		height: box.height
	};
}

module.exports = {
	tfx: tfx,
	relBox: relBox
};
