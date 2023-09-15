// class Modal {
//   private modal: HTMLElement;
//   private modalContent: HTMLElement;

//   constructor() {
//     this.modal = document.createElement('div');
//     this.modal.className = 'modal';
//     this.modal.style.display = 'none';

//     this.modalContent = document.createElement('div');
//     this.modalContent.className = 'modal-content';

//     const closeModalButton = document.createElement('span');
//     closeModalButton.className = 'close';
//     closeModalButton.innerHTML = '&times;';

//     closeModalButton.addEventListener('click', () => {
//       this.close();
//     });

//     this.modalContent.appendChild(closeModalButton);

//     const modalText = document.createElement('p');
//     modalText.textContent = 'This is a modal window.';
//     this.modalContent.appendChild(modalText);

//     this.modal.appendChild(this.modalContent);

//     document.body.appendChild(this.modal);

//     window.addEventListener('click', (event) => {
//       if (event.target === this.modal) {
//         this.close();
//       }
//     });
//   }

//   open() {
//     this.modal.style.display = 'block';
//   }

//   close() {
//     this.modal.style.display = 'none';
//   }
// }

// export default Modal;
// import { createTheme } from '@mui/material/styles';

// const theme = createTheme();

export function openModal() {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);

  const modalElement = document.createElement('div');
  modalRoot?.appendChild(modalElement);

  const handleClose = () => {
    modalRoot?.removeChild(modalElement);
  };

  const modal = document.createElement('div');
  modal.className = 'modal';

  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';

  modalContent.innerHTML = `
      <div style="padding: 12px; min-height: calc(100% - 52px); border-bottom: 1px solid #e1e5ea; display: flex;">
        <div style="">
          <div>Name 1</div>
          <div style="border: 1px solid #e1e5ea; border-radius: 8px; width: 230px; height: 230px;"></div>
          <div>attachment points 1</div>
        </div>
        <div style="">
          <div>Name 2</div>
          <div style="border: 1px solid #e1e5ea; border-radius: 8px; width: 230px; height: 230px;"></div>
          <div>attachment points 2</div>
        </div>
      </div>
      <footer style="display: flex; justify-content: space-between; max-width: 100%; padding: 16px 12px 12px; gap: 8px;">
        <button id="closeButton" style="display: inline-flex; justify-content: center; align-items: center; outline: none; min-width: 70px; line-height: 14px; height: 24px; border-radius: 4px; font-size: 12px; color: #585858; border: 1px solid #585858; background-color: #ffffff; text-transform: none; font-weight: 400;">Cancel</button>
        <input type="button" disabled style="display: inline-flex; justify-content: center; align-items: center; outline: none; min-width: 70px; line-height: 14px; height: 24px; border-radius: 4px; font-size: 12px; color: #ffffff; background-color: #167782; border: 1px solid transparent;" title="Bond will be added to canvas" value="Connect">
      </footer>
    `;

  modal.appendChild(modalContent);

  const modalStyle = `
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 40;
    background-image: url(data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2210%22%20height%3D%2210%22%3E%3Cpath%20d%3D%22M0%2010L10%200zm12-2l-4%204zM-2%202l4-4z%22%20stroke%3D%22%23555%22%20stroke-width%3D%222%22%20stroke-opacity%3D%22.02%22%2F%3E%3C%2Fsvg%3E);
    background-color: rgba(94, 94, 94, 0.2);
    background: none;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#335e5e5e', endColorstr='#335e5e5e');
    `;

  const modalContentStyle = `
    min-width: 500px;
    min-height: 500px;
    outline: 0;
    position: relative;
    vertical-align: middle;
    display: flex;
    flex-direction: column;
    text-align: left;
    background-color: #ffffff;
    border-radius: 8px;
    background-clip: padding-box;
    font-family: Inter, FreeSans, Arimo, 'Droid Sans', Helvetica, 'Helvetica Neue', Arial, sans-serif;
    color: #585858;
    opacity: 1;
    transform: scale(1);
    transition: transform 0.3s, opacity 0.3s;
    box-shadow: 0 5px 20px rgba(103, 104, 132, 0.25);
    background-color: #ffffff;
    `;

  modal.style.cssText = modalStyle;
  modalContent.style.cssText = modalContentStyle;

  modalElement.appendChild(modal);

  modalElement.style.display = 'block';

  // Add event listener for close button
  const closeButton = document.getElementById('closeButton');
  closeButton?.addEventListener('click', handleClose);
}
