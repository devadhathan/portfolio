/** Reset document + OS window scroll instantly — use on in-app navigations. */
export function scrollPageToTop() {
  if (typeof window === 'undefined') return;
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  // Desktop OS windows scroll inside `.os-window-body`, not the page.
  // Case studies use a nested `.os-case-scroll` column instead.
  document.querySelectorAll('.os-case-scroll, .os-window-body').forEach((node) => {
    if (node instanceof HTMLElement) node.scrollTop = 0;
  });
}
