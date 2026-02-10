/**
 * Interface for elements that can be paused/played.
 * All alpha-video-kit components implement this.
 */
export interface Pausable {
  play(): Promise<void> | void;
  pause(): void;
  readonly paused: boolean;
}

type TrackedEntry = {
  element: HTMLElement & Pausable;
  wasPlaying: boolean;
};

const tracked = new Map<Element, TrackedEntry>();

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  if (observer) return observer;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const info = tracked.get(entry.target);
        if (!info) continue;

        if (entry.isIntersecting) {
          if (info.wasPlaying) {
            info.element.play();
          }
        } else {
          info.wasPlaying = !info.element.paused;
          if (info.wasPlaying) {
            info.element.pause();
          }
        }
      }
    },
    { threshold: 0 },
  );

  return observer;
}

/**
 * Automatically pause an alpha-video-kit element when it leaves the viewport,
 * and resume playback when it re-enters.
 *
 * Uses a single shared IntersectionObserver for all tracked elements.
 *
 * @param element - Any alpha-video-kit element (`<alpha-video-kit-gl>`, `<alpha-video-kit-canvas>`, etc.)
 * @returns A dispose function that stops tracking the element.
 *
 * @example
 * ```ts
 * import { autopause } from '@alpha-video-kit/autopause';
 *
 * const player = document.querySelector('alpha-video-kit-gl');
 * const dispose = autopause(player);
 *
 * // Later, to stop auto-pausing:
 * dispose();
 * ```
 */
export function autopause(element: HTMLElement & Pausable): () => void {
  const obs = getObserver();
  const entry: TrackedEntry = { element, wasPlaying: !element.paused };
  tracked.set(element, entry);
  obs.observe(element);

  return () => {
    obs.unobserve(element);
    tracked.delete(element);

    if (tracked.size === 0 && observer) {
      observer.disconnect();
      observer = null;
    }
  };
}
