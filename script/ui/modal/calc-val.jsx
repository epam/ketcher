import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from './dialog';

class CalculatedValues extends Component {
    result () {
        return `Yo!`;
    }
    render (props) {
		console.info('PROPS', props);
        return (
            <Dialog caption="Calculated Values"
                    name="calc-val" params={props.params}
                    result={() => this.result()} buttons={["Cancel"]}>
              <label>Chemical Formula</label>
              <output>{JSON.stringify(props.gross)}</output><br />
              <label>Molecular Weight</label>
              <output>{JSON.stringify(props.molecular-weight)}</output><br />
              <label>Exact Mass</label>
              <output>{JSON.stringify(props.most-abundant-mass)}</output><br />
              <label>Elemental Analysis</label>
              <output>{JSON.stringify(props.mass-composition)}</output><br />
            </Dialog>
        );
    }
}


export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <CalculatedValues {...params}/>
    ), overlay);
};
