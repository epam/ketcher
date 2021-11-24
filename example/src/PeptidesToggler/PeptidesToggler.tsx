import './PeptidesToggler.css'

interface PeptidesTogglerProps {
  toggle: any
}

const PeptidesToggler = ({ toggle }: PeptidesTogglerProps) => {
  return (
    <label className="switch">
      <input type="checkbox" onChange={e => toggle(e.target.checked)} />
      <span className="slider" />
    </label>
  )
}

export { PeptidesToggler }
