/****************************************************************************
 * Copyright (C) 2017 EPAM Systems
 *
 * This file is part of the Ketcher
 * The contents are covered by the terms of the BSD 3-Clause license
 * which is included in the file LICENSE.md, found at the root
 * of the Ketcher source tree.
 ***************************************************************************/

import { h } from 'preact';
/** @jsx h */
import classNames from 'classnames';

import action from '../action';
import { hiddenAncestor } from '../state/toolbar';

const isMac = /Mac/.test(navigator.platform);
const shortcutAliasMap = {
	'Escape': 'Esc',
	'Delete': 'Del',
	'Mod': isMac ? '⌘' : 'Ctrl'
};

export function shortcutStr(shortcut) {
	const key = Array.isArray(shortcut) ? shortcut[0] : shortcut;
	return key.replace(/(\b[a-z]\b$|Mod|Escape|Delete)/g, function (key) {
		return shortcutAliasMap[key] || key.toUpperCase();
	});
}

function ActionButton({action, status={}, onAction, ...props}) {
	let shortcut = action.shortcut && shortcutStr(action.shortcut);
	return (
		<button disabled={status.disabled}
				onClick={(ev) => {
					if (!status.selected) {
						onAction(action.action);
						ev.stopPropagation();
					}
				} }
				title={shortcut ? `${action.title} (${shortcut})` :	action.title}>
			{action.title}
		</button>
	)
}

function ActionMenu({name, menu, className, role, ...props}) {
	return (
		<menu className={className} role={role}
			  style={toolMargin(name, menu, props.visibleTools)}>
		{
		  menu.map(item => (
			  <li id={item.id || item}
				  className={classNames(props.status[item]) + ` ${item.id === props.opened ? 'opened' : ''}`}
				  onClick={(ev) => openHandle(ev, props.onOpen) }>
				{ typeof item !== 'object' ?
					( <ActionButton {...props} action={action[item]}
									status={props.status[item]} /> ) :
						item.menu ?
				  ( <ActionMenu {...props} name={item.id} menu={item.menu} /> ) :
							item.component(props)
				}
			  </li>
		  ))
		}
		</menu>
	);
}

function toolMargin(menuName, menu, visibleTools) {
	if (!visibleTools[menuName]) return {};
	let iconHeight = (window.innerHeight < 600 || window.innerWidth < 1040) ? 32 : 40;
																		// now not found better way
	let index = menu.indexOf(visibleTools[menuName]); // first level

	if (index === -1) {
		let tools = [];
		menu.forEach(item => tools = tools.concat(item.menu));
		index = tools.indexOf(visibleTools[menuName]); // second level. example: `bond: bond-any`
	}

	return (index !== -1) ? { marginTop: -(iconHeight * index) + 'px' } : {};
}

function openHandle(event, onOpen) {
	let hiddenEl = hiddenAncestor(event.currentTarget);

	if (hiddenEl) onOpen(hiddenEl.id);
	event.stopPropagation();
}

export default ActionMenu;
