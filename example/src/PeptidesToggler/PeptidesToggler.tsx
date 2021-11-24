import './PeptidesToggler.css'

interface TogglerProps {
  toggle: any
}

const PeptidesToggler = ({ toggle }: TogglerProps) => {
  return (
    <label className="switch">
      <input type="checkbox" onChange={e => toggle(e.target.checked)} />
      <span className="slider round" />
    </label>
  )
}

export { PeptidesToggler }
