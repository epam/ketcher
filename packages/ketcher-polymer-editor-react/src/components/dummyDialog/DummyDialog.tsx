import { useCallback } from 'react'
import { Modal } from 'components/shared/ui/modal'
import { ActionButton } from 'components/shared/ui/actionButton'

export const DummyDialog = ({ isModalOpen, setIsModalOpen }) => {
  const onCloseHandler = useCallback(() => {
    setIsModalOpen(false)
  }, [setIsModalOpen])

  const onOkHandler = useCallback(() => {
    console.log('OK')
    setIsModalOpen(false)
  }, [setIsModalOpen])

  return (
    <Modal
      title="Warning!"
      isModalOpen={isModalOpen}
      onCloseHandler={onCloseHandler}
    >
      <Modal.Content>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin at
          lacinia ligula. Suspendisse at purus ullamcorper, convallis urna et,
          pulvinar neque. Nunc nisl felis, congue quis arcu pretium, interdum
          sagittis nibh. Fusce tristique urna tortor, vitae elementum urna
          viverra et. Vestibulum at arcu ex. Pellentesque eros felis, dignissim
          eu nulla a, laoreet mattis erat. Fusce et lectus scelerisque,
          condimentum leo ut, semper felis. In non fringilla lorem, vel aliquet
          arcu. Morbi tempor mi mi, et ultrices nisi ornare ac. Integer sodales
          ullamcorper dignissim. Praesent blandit vehicula nisi. Donec tristique
          iaculis mattis. Nunc ligula neque, scelerisque nec magna et, tincidunt
          dignissim risus. Fusce ex mi, elementum id rhoncus ac, iaculis non
          nibh. Duis iaculis turpis leo. Suspendisse ac nulla non nunc commodo
          volutpat. Nunc nec laoreet mi, a mollis orci. Pellentesque vestibulum
          mollis ligula ut semper. Class aptent taciti sociosqu ad litora
          torquent per conubia nostra, per inceptos himenaeos. Etiam sapien leo,
          aliquam vel hendrerit et, tristique ut massa. Donec et arcu nec risus
          mollis auctor. Vestibulum efficitur sem non enim eleifend ullamcorper.
          Duis quis tincidunt neque. Nulla at libero erat. Nam varius arcu in
          ligula feugiat, vitae vulputate tortor vehicula. Aenean quis ornare
          neque, vel fermentum nulla. Sed efficitur in dolor in porta. Sed
          pulvinar lacus id risus commodo, quis suscipit nisl condimentum. Ut
          sed volutpat dui. Quisque mattis magna non lorem tincidunt interdum.
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec commodo
          maximus justo, sed lobortis leo pretium nec. Nullam ac justo eleifend,
          interdum velit a, congue metus. Proin in sagittis mi. Class aptent
          taciti sociosqu ad litora torquent per conubia nostra, per inceptos
          himenaeos. Class aptent taciti sociosqu ad litora torquent per conubia
          nostra, per inceptos himenaeos. Nam pellentesque urna nec cursus
          fringilla. Morbi quis congue mauris, sit amet tempor sem. Nam felis
          risus, ullamcorper vitae nibh non, vehicula porttitor velit. In purus
          sapien, convallis id eleifend eleifend, imperdiet vitae nisi. Vivamus
          semper, tortor et vestibulum aliquet, neque lacus vulputate turpis,
          vel iaculis orci diam eu ex. In felis elit, volutpat in pulvinar in,
          consectetur tempor ipsum.
        </div>
      </Modal.Content>
      <Modal.Footer>
        <ActionButton label="OK" clickHandler={onOkHandler} />
        <ActionButton label="Cancel" clickHandler={onCloseHandler} />
      </Modal.Footer>
    </Modal>
  )
}
