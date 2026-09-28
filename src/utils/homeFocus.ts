export type HomeSection = 'top' | 'class' | 'progress' | 'skills' | 'rewards' | 'plan';

type Listener = (section: HomeSection, token: number) => void;

let listener: Listener | null = null;
let token = 0;

/**
 * The demo panel lives in the root layout, Home lives in a route. Rather than
 * thread a ref through the router, they talk over this one-line channel.
 */
export function focusHomeSection(section: HomeSection) {
  token += 1;
  listener?.(section, token);
}

export function onHomeFocus(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}
