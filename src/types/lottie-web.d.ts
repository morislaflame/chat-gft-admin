declare module 'lottie-web' {
  // lottie-web is brought transitively by lottie-react in this project.
  // We only need minimal typing for dynamic import usage.
  export type LottieEventName = 'DOMLoaded' | 'data_failed' | string;

  export interface AnimationItem {
    addEventListener(eventName: LottieEventName, callback: () => void): void;
    goToAndStop(value: number, isFrame: boolean): void;
    destroy(): void;
  }

  export interface LottiePlayer {
    loadAnimation(options: Record<string, unknown>): AnimationItem;
  }

  const lottie: LottiePlayer;
  export default lottie;
}

