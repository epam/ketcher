export function fromRlabel(rg) {
	const res = [];
	let rgi;
	let val;
	for (rgi = 0; rgi < 32; rgi++) {
		if (rg & (1 << rgi)) {
			val = rgi + 1;
			res.push(val); // push the string
		}
	}
	return res;
}

export function toRlabel(values) {
	let res = 0;
	values.forEach((val) => {
		const rgi = val - 1;
		res |= 1 << rgi;
	});
	return res;
}

export function fromDisplay(disp) {
	const res = {};
	if (disp === 'relative') {
		return {
			...res,
			absolute: false,
			attached: false
		};
	} else if (disp === 'attached') {
		return {
			...res,
			absolute: false,
			attached: true
		};
	}
	return null;
}

export function toDisplay(abs, att) {
	const rel = !(abs || att);
	if (rel) return 'relative';
	else if (abs) return 'absolute';
	return 'attached';
}
