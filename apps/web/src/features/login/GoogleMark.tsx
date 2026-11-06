import googleGUrl from "../../ui/assets/google-g.svg";
import styles from "./GoogleMark.module.css";

// Google's standard "G" from its sign-in branding bundle, on a white circle
// inside the ink primary button (sign-in plan SI-11; owner, 2026-11-06).
// Google's rules: the G keeps its colours and sits on white. Decorative: the
// button's text names the action.
export function GoogleMark() {
  return (
    <span className={styles.mark} aria-hidden>
      <img src={googleGUrl} alt="" width={18} height={18} />
    </span>
  );
}
