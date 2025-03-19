export const scrollToElement = (selector: string, alignToTop = true) => {
  const element = document.body.querySelector(selector);
  element?.scrollIntoView(alignToTop);
};
