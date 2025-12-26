/**
 * Wait for the next tick
 */
export function nextTick() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}
