import _ from 'lodash';

export const notifyRenderComplete = _.debounce(() => {
  const event = new Event('renderComplete');
  window.dispatchEvent(event);
}, 750);

export const notifyItemsToMergeInitializationComplete = () => {
  const event = new Event('itemsToMergeInitializationComplete');
  window.dispatchEvent(event);
};
