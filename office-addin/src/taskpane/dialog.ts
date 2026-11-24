import {
  EDITOR_PAGE,
  OFFICE_DIALOG_FLAG,
  type DialogToHostMessage,
  type HostToDialogMessage,
  type StructurePayload,
} from '../shared/messages';

// Opens Ketcher in an Office dialog. Resolves with the drawn structure, or
// null if the user cancels or closes the dialog.
export function editInKetcher(
  initialKet: string | null,
): Promise<StructurePayload | null> {
  const url = new URL(EDITOR_PAGE, window.location.href);
  url.searchParams.set(OFFICE_DIALOG_FLAG, '1');

  return new Promise((resolve, reject) => {
    Office.context.ui.displayDialogAsync(
      url.href,
      { height: 85, width: 80, displayInIframe: false },
      (result) => {
        if (result.status === Office.AsyncResultStatus.Failed) {
          reject(new Error(result.error.message));
          return;
        }

        const dialog = result.value;
        const finish = (payload: StructurePayload | null) => {
          dialog.close();
          resolve(payload);
        };

        dialog.addEventHandler(
          Office.EventType.DialogMessageReceived,
          (arg) => {
            if (!('message' in arg)) return;
            const message = JSON.parse(arg.message) as DialogToHostMessage;
            switch (message.type) {
              case 'ready': {
                const reply: HostToDialogMessage = {
                  type: 'load',
                  ket: initialKet,
                };
                dialog.messageChild(JSON.stringify(reply));
                break;
              }
              case 'insert':
                finish({ ket: message.ket, svg: message.svg });
                break;
              case 'cancel':
                finish(null);
                break;
            }
          },
        );

        // Fires when the user closes the dialog window.
        dialog.addEventHandler(Office.EventType.DialogEventReceived, () =>
          resolve(null),
        );
      },
    );
  });
}
