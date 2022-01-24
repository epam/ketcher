export const Confirm = ({ onOk, onCancel }) => {
  return (
    <div>
      <div>
        Warning: Unsupported S-group type found. Would you like to import
        structure without it?
      </div>
      <input type="button" value={'Cancel'} onClick={() => onCancel()} />
      <input type="button" value={'OK'} onClick={() => onOk()} />
    </div>
  )
}
