export function debounce(func: () => void, delay: number): () => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func();
      timeoutId = null;
    }, delay);
  };
}
