import type { CustomButton } from '../../../../builders/ketcher/CustomButtons';
import { Divider } from './Divider';
import { TopToolbarCustomIconButton } from './TopToolbarIconButton';
import { ElementWithDropdown } from './ElementWithDropdown';

interface CustomButtonElementProperties {
  customButton: CustomButton;
  onClick: (name: string) => void;
}

interface CustomButtonsProperties {
  customButtons: Array<CustomButton>;
  isCollapsed: boolean;
  onCustomAction: (name: string) => void;
}

const CustomButtonElement = ({
  customButton,
  onClick,
}: CustomButtonElementProperties) => (
  <TopToolbarCustomIconButton
    link={customButton.imageLink}
    onClick={() => onClick(customButton.id)}
    title={customButton.title}
  />
);

export const CustomButtons = ({
  isCollapsed,
  customButtons,
  onCustomAction,
}: CustomButtonsProperties) => {
  if (customButtons.length === 0) {
    return null;
  }

  if (isCollapsed) {
    return (
      <>
        <Divider />
        <ElementWithDropdown
          topElement={
            <CustomButtonElement
              customButton={customButtons[0]}
              onClick={onCustomAction}
            />
          }
          dropDownElements={customButtons.slice(1).map((customButton) => (
            <CustomButtonElement
              key={customButton.id}
              customButton={customButton}
              onClick={onCustomAction}
            />
          ))}
        />
      </>
    );
  }

  return (
    <>
      <Divider />
      {customButtons.map((customButton) => (
        <CustomButtonElement
          key={customButton.id}
          customButton={customButton}
          onClick={onCustomAction}
        />
      ))}
    </>
  );
};
