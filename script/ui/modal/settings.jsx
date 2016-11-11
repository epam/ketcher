import { h, Component, render } from 'preact';
/** @jsx h */

import Dialog from '../component/dialog';
import OpenButton from '../component/openbutton';
import SaveButton from '../component/savebutton';
import Accordion from '../component/accordion';
import SystemFonts from '../component/systemfonts';
import defaultOptions from './options';

class Settings extends Component {
     constructor(props) {
        super(props);
        this.defOpts = defaultOptions();

        this.state = {
            onlyCurrentSession: false
        };

        var opts = this.getDefOpts(this.defOpts);
        opts = Object.assign(opts, props.opts, JSON.parse(localStorage.getItem("ketcher-opts")));
        this.setState({opts: opts});

        this.changeState = this.changeState.bind(this);
        this.createSelectList = this.createSelectList.bind(this);
    }

    getDefOpts(defOpts) {
        var tmp = {};
        for (var i = 0; i < defOpts.length; i++) {
			if (defOpts[i].type == 'field') tmp[defOpts[i].name + "Measure"] = defOpts[i].defaultMeasure;
            tmp[defOpts[i].name] = defOpts[i].defaultValue;
        }
        return tmp;
    }

    result () {
        return {
            opts: this.state.opts,
            localStorageOpts: this.state.opts,
            onlyCurrentSession: this.state.onlyCurrentSession
        };
    }

    uploadSettings(newOpts) {
    	try {
			let userOpts = JSON.parse(newOpts);
			let currentState = Object.assign(this.state.opts, userOpts);
			this.setState({
				opts: currentState
			});
		} catch (ex) {
			console.info('Bad file');
		}
    }

    changeState(name, value) {
         var tmp = {};
         tmp[name] = value;
		 this.setState(Object.assign(this.state.opts, tmp));
    }

	createSelectList(elem) {
		let change = this.changeState;
		let {values, type, name, label} = elem;
		let content = null;
		switch (type) {
			case 'font':
				content = <div><SystemFonts current={this.state.opts.font}
											onChange={ev => change(name, '30px ' + ev.target.value)}/></div>;
				break;
			case 'field':
				content = <MeasureField name={ name } onChange={ change } values = { values }
					value = { this.state.opts[name] } measureValue = { this.state.opts[name + "Measure"] } />;
				break;
			case 'boolean':
				content = <div><SelectCheck name={ name } onChange={ change } value={ this.state.opts[name] }/></div>;
				break;
			default:
				let listComponents = values.map(function (value) {
					return ( <option value={value}> {value} </option>);
				});
				content = <div><select onChange={ ev => change(name, ev.target.value) }
									   value={this.state.opts[name]}>{listComponents}</select></div>;
		}
		return (
			<li>
				<div> { label } </div>
				{ content }
			</li>
		);
	}

    draw(tab) {
        var createSelectList = this.createSelectList;
        var optsComponents = this.defOpts.map(function(elem) {
            if (elem.tab === tab)
                return createSelectList(elem);
        });
        return <ul> {optsComponents} </ul>;
    }

    reset(ev) {
        var opts = this.getDefOpts (this.defOpts);
        this.setState({opts: opts});
    }

    apply(ev) {
        this.setState({onlyCurrentSession: true});
    }

    render (props, state) {
    	let tabs = ['Rendering customization options', 'Atoms', 'Bonds', 'Options for debugging'];
    	let activeTabs = {'0': true, '1': false, '2': true, '3': false};
        return (
            <Dialog caption="Settings"
                    name="settings" params={props.params}
                    result={() => this.result()}
                     buttons={[
						 <OpenButton className="open" server={this.props.server}
									 onLoad={ newOpts => this.uploadSettings(newOpts) }>
							 Open From File…
						 </OpenButton>,
						 <SaveButton className="save" data={JSON.stringify(this.state.opts)}
									 filename={'ketcher-settings'} >
							 Save To File…
						 </SaveButton>,
                     <button onClick={ ev => this.reset(ev) }>Reset</button>,
                     "OK", "Cancel"]} >
            <div className="accordion-wrapper">
				<Accordion className="accordion" captions={tabs} active={activeTabs}>
					<div className="content">
						{ this.draw("render") }
					</div>
					<div className="content">
						{ this.draw("atoms") }
					</div>
					<div className="content">
						{ this.draw("bonds") }
					</div>
					<div className="content">
						{ this.draw("debug") }
					</div>
				</Accordion>
				<label className="current">
					<input type="checkbox" onChange={ ev => this.apply(ev) }></input>
					Apply settings only for current session
				</label>
            </div>
            </Dialog>
        );
    }
}

function SelectCheck({ name, value, onChange }) {
	return (
		<select onChange={ev => onChange(name, ev.target.value == "on") } value={value ? "on" : "off"}>
			<option value="on">on</option>
			<option value="off">off</option>
		</select>
	);
}

function MeasureField({ name, value, values, measureValue, onChange }) {
	function setValue(ev) {
		var valuepx = convertValue(ev.target.value, measureValue, 'px');
		if (valuepx <= values[0] || valuepx > values[1]) {
			ev.target.value = convertValue(value, 'px', measureValue);
			return;
		}
		onChange(name, valuepx);
	}
	return (
		<div>
			<input type="number" min={ values[0] } max={ values[1] }
				   onChange={ ev => setValue(ev) } value={ convertValue(value, 'px', measureValue) }/>
			<select className="measure" value={measureValue || 'px'} onChange={ ev => onChange(name + "Measure", ev.target.value) }>
				<option value="cm">cm</option>
				<option value="px">px</option>
				<option value="pt">pt</option>
				<option value="inch">inch</option>
			</select>
		</div>
	);
}

function convertValue(value, measureFrom, measureTo) {
	if (!value) return null;
	var measureMap = {
		'px': 1,
		'cm': 37.795278,
		'pt': 1.333333,
		'inch': 96,
	};
	return (measureTo == 'px' || measureTo == 'pt')
		? (value * measureMap[measureFrom] / measureMap[measureTo]).toFixed()
		: (value * measureMap[measureFrom] / measureMap[measureTo]).toFixed(3);
}

export default function dialog(params) {
    var overlay = $$('.overlay')[0];
    return render((
        <Settings params={params}/>
    ), overlay);
};
