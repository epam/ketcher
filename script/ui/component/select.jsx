import { h, Component } from 'preact';
/** @jsx h */

function SelectList ({ children, options, onChange, value, ...props}) {
  return (
    <ul {...props} tabindex="0">{
        options.map((opt, index) => (
          <li onClick={() => onChange(opt, index) }
              className={opt == value ? 'selected' : ''}>
            {opt}</li>
        ))
    }</ul>
  );
}

export default SelectList;
