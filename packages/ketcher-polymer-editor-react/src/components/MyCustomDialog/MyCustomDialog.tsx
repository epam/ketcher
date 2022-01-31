import { Modal } from 'components/shared/ui/modal'
import { ActionButton } from '../shared/ui/actionButton/ActionButton'

export const MyCustomDialog = () => {
  const style = {
    width: 1024
  }

  return (
    <Modal title="Warning!">
      <Modal.Content>
        <div>
          <div style={style}>
            Unsupported S-group type found. Would you like to import structure
            without it?Unsupported S-group type found. Would you like to import
            structure without it?Unsupported S-group type found. Would you like
            to import structure without it?Unsupported S-group type found. Would
            you like to import structure without it?Unsupported S-group type
            found. Would you like to import structure without it?Unsupported
            S-group type found. Would you like to import structure without
            it?Unsupported S-group type found. Would you like to import
            structure without it?Unsupported S-group type found. Would you like
            to import structure without it?Unsupported S-group type found. Would
            you like to import structure without it?Unsupported S-group type
            found. Would you like to import structure without it?Unsupported
            S-group type found. Would you like to import structure without
            it?Unsupported S-group type found. Would you like to import
            structure without it?Unsupported S-group type found. Would you like
            to import structure without it?Unsupported S-group type found. Would
            you like to import structure without it?Unsupported S-group type
            found. Would you like to import structure without it?Unsupported
            S-group type found. Would you like to import structure without
            it?Unsupported S-group type found. Would you like to import
            structure without it?Unsupported S-group type found. Would you like
            to import structure without it?Unsupported S-group type found. Would
            you like to import structure without it?Unsupported S-group type
            found. Would you like to import structure without it?Unsupported
            S-group type found. Would you like to import structure without
            it?Unsupported S-group type found. Would you like to import
            structure without it?Unsupported S-group type found. Would you like
            to import structure without it?
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton
          label="OK"
          clickHandler={() => {
            console.log('OK')
          }}
        />
        <ActionButton
          label="Cancel"
          clickHandler={() => {
            console.log('Cancel')
          }}
        />
      </Modal.Footer>
    </Modal>
  )
}
