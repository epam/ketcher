import { css } from '@emotion/react'
import { Modal } from '../../shared/ui/modal/Modal'

export const MyCustomDialog = () => {
  const buttonOkStyles = css`
    border-radius: 2px;
    border: none;
    height: 1.8em;
    width: content-box;

    &:hover {
      background: @color-button-primary-hover;
    }
  `
  const buttonCancelStyles = css`
    border-radius: 2px;
    border: none;
    height: 1.8em;
    width: content-box;
    margin-right: 15px;
    background: transparent;

    &:hover {
      background: @color-button-primary-hover;
    }
  `

  return (
    <Modal title="Warning!">
      <Modal.Content>
        <div>
          <div>
            Unsupported S-group type found. Would you like to import structure
            without it?
          </div>
        </div>
      </Modal.Content>
      <Modal.Footer>
        <input
          type="button"
          value={'Cancel'}
          css={buttonCancelStyles}
          // onClick={() => onCancel()}
        />
        <input
          type="button"
          value={'OK'}
          css={buttonOkStyles}
          // onClick={() => onOk()}
        />
      </Modal.Footer>
    </Modal>
  )
}
