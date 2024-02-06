export const scrollToElement = (selector) => {
  const element = document.body.querySelector(selector);
  element?.scrollIntoView({ behavior: 'smooth' });
};
