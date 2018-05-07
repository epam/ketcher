import { RxnPlus, RxnArrow } from '../../../chem/struct';

export function rxnToStruct(graphItem, struct) {
	if (graphItem.type === 'arrow') struct.rxnArrows.add(new RxnArrow({ pp: graphItem.location }));
	else struct.rxnPluses.add(new RxnPlus({ pp: graphItem.location }));
	return struct;
}
