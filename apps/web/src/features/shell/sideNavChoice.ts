// The person's SideNav choice, kept per browser. Storage can throw in private
// browsing, and unknown values are ignored.
const storageKey = "storage-minis.sideNav";

export type SideNavChoice = "collapsed" | "expanded";

export function readSideNavChoice(): SideNavChoice | undefined {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === "collapsed" || saved === "expanded" ? saved : undefined;
  } catch {
    return undefined;
  }
}

export function saveSideNavChoice(choice: SideNavChoice): void {
  try {
    localStorage.setItem(storageKey, choice);
  } catch {
    // The choice still applies until the page reloads.
  }
}
