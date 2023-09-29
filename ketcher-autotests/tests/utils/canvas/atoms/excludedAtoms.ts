import { AtomButton } from '@utils';

export const atomsNames: AtomButton[] = Object.values(AtomButton).filter(
  (name) =>
    ![
      AtomButton.Gold,
      AtomButton.Platinum,
      AtomButton.Periodic,
      AtomButton.Any,
      AtomButton.Extended,
    ].includes(name),
);
