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
                     [{caption='Chemical Formula', key='gross'},
                      {caption='Molecular Weigh', key='molecular-wieght'},
                      {caption='Exact Mass', key='most-abundant-mass'},
                      {caption='Elemental Analysis', key='mass-composition'}
                      ].map( v => ( <label>{v.caption}<output>{props[v.key]}</output></label>))

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
