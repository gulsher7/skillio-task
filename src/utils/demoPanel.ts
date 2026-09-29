type Listener = () => void;

let listener: Listener | null = null;

/** Dev-only: long-pressing the Home avatar opens the state switcher. */
export function openDemoPanel() {
  listener?.();
}

export function onDemoPanelOpen(fn: Listener) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}
