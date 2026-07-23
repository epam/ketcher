export const scrollToElement = (selector: string) => {
  const element = document.body.querySelector(selector);
  element?.scrollIntoView();
};
