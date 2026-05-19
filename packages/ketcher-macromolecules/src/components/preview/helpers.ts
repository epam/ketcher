import { AUTOCHAIN_ELEMENT_CLASSNAME } from 'components/monomerLibrary/monomerLibraryItem';

const classNamesToSkipPreview = [AUTOCHAIN_ELEMENT_CLASSNAME];

export const needSkipPreviewForElement = (element: HTMLElement) => {
  return classNamesToSkipPreview.some(
    (className) =>
      element.classList.contains(className) || element.closest(`.${className}`),
  );
};
