import _ from 'lodash';

export const notifyRenderComplete = _.debounce(() => {
  const event = new Event('renderComplete');
  window.dispatchEvent(event);
}, 750);
