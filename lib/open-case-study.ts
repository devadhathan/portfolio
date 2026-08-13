/**
 * Open the Home OS window, then select a case study once Home can receive nav actions.
 * Shared by menubar Case studies menu and the widgets panel.
 */
export function openCaseStudyInHomeWindow(args: {
  openWindow: (id: 'home', opts?: { syncUrl?: boolean }) => void;
  selectProject: (slug: string) => void;
  slug: string;
}) {
  args.openWindow('home');
  // Brief settle so a freshly mounted Home window can register onProjectSelectRef.
  window.setTimeout(() => {
    args.selectProject(args.slug);
  }, 48);
}
