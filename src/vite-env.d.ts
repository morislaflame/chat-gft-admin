/// <reference types="vite/client" />

interface TelegramWebApp {
    initData: string;
    initDataUnsafe: TelegramWebAppInitDataUnsafe;
    WebApp?: {
      initData: string;
      initDataUnsafe: TelegramWebAppInitDataUnsafe;
      HapticFeedback?: {
        impactOccurred: (style: string) => void;
      };
      openInvoice: (url: string, callback: (status: string) => void) => void;
      BackButton: {
        show: () => void;
        hide: () => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
      };
      openTelegramLink: (url: string) => void;
      openLink: (url: string) => void;
      disableVerticalSwipes: () => void;
      enableVerticalSwipes: () => void;
      lockOrientation: () => void;
      unlockOrientation: () => void;
      expand: () => void;
      close: () => void;
      ready: () => void;
      setHeaderColor: (color: string) => void;
      setBackgroundColor: (color: string) => void;
      shareMessage: (msgId: string, callback?: (success: boolean) => void) => void;
      showPopup: (options: { title: string; message: string; buttons: { type: string; text: string }[] }) => void;
      Gyroscope?: {
        isStarted: boolean;
        x: number;
        y: number;
        z: number;
        start: (params: { refresh_rate?: number }) => void;
        stop: () => void;
      };
    };
  }
  
  interface Window {
    Telegram?: TelegramWebApp;
    __REACT_ROOT__?: ReactDOM.Root;
  }