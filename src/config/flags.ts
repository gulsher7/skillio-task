/**
 * Build-time switches.
 *
 * `EXPO_PUBLIC_*` values are inlined by Metro when the bundle is built, so this
 * resolves to a constant and the dead branch is stripped from a release bundle.
 */

/**
 * Whether the Home avatar's long-press opens the state switcher.
 *
 * On in development, and on in the review APK — the seven edge states are the
 * point of the submission, and a reviewer with no way to reach them is left
 * looking at one of them. A store build would leave this unset and ship without
 * the panel.
 */
export const SHOW_DEMO_PANEL = __DEV__ || process.env.EXPO_PUBLIC_DEMO_PANEL === '1';
