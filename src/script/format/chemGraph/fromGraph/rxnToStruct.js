import { RxnPlus, RxnArrow } from '../../../chem/struct';

export function rxnToStruct(graphItem, struct) {
	if (graphItem.type === 'arrow') {
		struct.rxnArrows.add(new RxnArrow({
			pp: {
				x: graphItem.location[0],
				y: graphItem.location[1],
				z: graphItem.location[2]
			}
		}));
	} else {
		struct.rxnPluses.add(new RxnPlus({
			pp: {
				x: graphItem.location[0],
				y: graphItem.location[1],
				z: graphItem.location[2]
			}
		}));
	}
	return struct;
}
