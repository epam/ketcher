import ketcherIcon from '/favicon.ico?url';
import openSource from './openSource.ico?url';

export enum CustomButtonsName {
  Zoom350 = 'zoom350',
  SelectAll = 'selectAll',
}

/* export const customButtons = new Array(20).fill(null).map((_, index) => ({
  id: `button_${index}`,
  imageLink: openSource,
  title: `Button #${index}`,
})); */

export const customButtons = [
  {
    id: CustomButtonsName.Zoom350,
    imageLink: ketcherIcon,
    title: 'Zoom to 350',
  },
  {
    id: CustomButtonsName.SelectAll,
    imageLink: openSource,
    title: 'Select All',
  },
];
